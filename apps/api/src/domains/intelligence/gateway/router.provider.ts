import type { AiCapabilities, AiProviderId, AiStructuredMode } from "@finwise/core";
import { Logger } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { db } from "../../../platform/data/index.js";
import { platformSettings } from "../../../platform/data/schema/index.js";
import { env, envKey } from "../../../kernel/env.js";
import { decryptSecret, encryptSecret } from "../../integrations/crypto.js";
import { AnthropicProvider } from "./anthropic.provider.js";
import { NoopProvider } from "./noop.provider.js";
import { OpenAiCompatibleProvider } from "./openai-compatible.provider.js";
import { capabilitiesFor, presetFor } from "./presets.js";
import { type PriceSource, resolvePrice } from "./pricing.js";
import type { ClassificationOutput, ExtractionOutput } from "./schemas.js";
import {
  type AiProvider,
  AiProviderError,
  type ClassifyInput,
  type ExtractInput,
  type GenerateInput,
  type ProviderResult,
  type ToolRunInput,
  type ToolRunOutput,
} from "./types.js";

export const AI_SETTING_KEY = "ai";

/** One model as an admin saved it. The key is encrypted; without one, the provider's .env key is used. */
export type StoredModel = {
  provider: AiProviderId;
  model: string;
  baseUrl?: string | null;
  apiKeyEncrypted?: string | null;
  vision?: boolean | null;
  tools?: boolean | null;
  structured?: AiStructuredMode | null;
  prices?: { input: number; output: number; cacheRead?: number | null } | null;
};
export type StoredAiConfig = { primary: StoredModel; vision?: StoredModel | null };

/** A model ready to call: every default filled in, the key in the clear (memory only). */
export type ResolvedModel = {
  provider: AiProviderId;
  providerName: string;
  model: string;
  baseUrl: string | null;
  apiKey: string | null;
  apiKeySource: "admin" | "env" | null;
  capabilities: AiCapabilities;
  price: { input: number; output: number; cacheRead: number; cacheWrite?: number; source: PriceSource };
  overrides: { vision: boolean | null; tools: boolean | null; structured: AiStructuredMode | null; prices: boolean };
};

export type ResolvedConfig = {
  source: "admin" | "env" | "none";
  primary: ResolvedModel | null;
  vision: ResolvedModel | null;
  /** Why there is no usable primary model. */
  reason: string | null;
  updatedAt: Date | null;
  updatedBy: string | null;
};

const aad = (slot: "primary" | "vision") => `platform:ai:${slot}`;
export const encryptAiKey = (key: string, slot: "primary" | "vision") => encryptSecret(key, { aad: aad(slot) });

function resolveModel(stored: StoredModel, slot: "primary" | "vision", fromAdmin: boolean): ResolvedModel | string {
  const preset = presetFor(stored.provider);
  let apiKey: string | null = null;
  let apiKeySource: ResolvedModel["apiKeySource"] = null;
  if (stored.apiKeyEncrypted) {
    try {
      apiKey = decryptSecret(stored.apiKeyEncrypted, { aad: aad(slot) });
      apiKeySource = fromAdmin ? "admin" : "env";
    } catch {
      return `The saved ${preset.name} key can't be decrypted (was ENCRYPTION_KEY changed?). Save the key again in Admin → AI.`;
    }
  } else {
    apiKey = envKey(preset.envKey) ?? (stored.provider === "custom" ? envKey("AI_API_KEY") : undefined) ?? null;
    apiKeySource = apiKey ? "env" : null;
  }
  const model = stored.model.trim() || preset.defaultModel;
  const baseUrl = stored.baseUrl?.trim() || preset.baseUrl;
  if (!model) return `Choose a model for ${preset.name}.`;
  if (stored.provider !== "anthropic" && !baseUrl) return `${preset.name} needs an endpoint URL.`;
  if (preset.keyRequired && !apiKey) {
    return `No API key for ${preset.name}. Add it in Admin → AI${preset.envKey ? ` or set ${preset.envKey} on the server` : ""}.`;
  }
  const price = resolvePrice(model, { override: stored.prices, local: preset.local });
  return {
    provider: stored.provider,
    providerName: preset.name,
    model,
    baseUrl: stored.provider === "anthropic" ? (stored.baseUrl?.trim() ?? null) : baseUrl,
    apiKey,
    apiKeySource,
    capabilities: capabilitiesFor(stored.provider, model, stored),
    price: { ...price, cacheRead: price.cacheRead ?? price.input * 0.1 },
    overrides: { vision: stored.vision ?? null, tools: stored.tools ?? null, structured: stored.structured ?? null, prices: Boolean(stored.prices) },
  };
}

/** The .env settings as if an admin had saved them (keys stay in the environment). */
function fromEnv(): StoredAiConfig | null {
  if (env.AI_PROVIDER === "none") return null;
  const primary: StoredModel = {
    provider: env.AI_PROVIDER,
    model: env.AI_MODEL ?? "",
    baseUrl: env.AI_BASE_URL ?? null,
  };
  const vision: StoredModel | null =
    env.AI_VISION_PROVIDER === "none" ? null : { provider: env.AI_VISION_PROVIDER, model: env.AI_VISION_MODEL ?? "", baseUrl: env.AI_VISION_BASE_URL ?? null };
  return { primary, vision };
}

/** The AI_API_KEY / AI_VISION_API_KEY fallbacks, which apply to whichever provider .env names. */
function envGenericKey(stored: StoredModel, slot: "primary" | "vision"): StoredModel {
  const generic = slot === "primary" ? env.AI_API_KEY : env.AI_VISION_API_KEY;
  if (!generic || envKey(presetFor(stored.provider).envKey)) return stored;
  return { ...stored, apiKeyEncrypted: encryptAiKey(generic, slot) };
}

/** OPENROUTER_FALLBACK_MODEL: an OpenRouter model retried when the primary provider has a transport failure. */
function envFallbackModel(primary: ResolvedModel | null): ResolvedModel | null {
  const model = env.OPENROUTER_FALLBACK_MODEL?.trim();
  const apiKey = envKey("OPENROUTER_API_KEY");
  if (!model || !apiKey || primary?.provider === "openrouter") return null;
  const preset = presetFor("openrouter");
  const price = resolvePrice(model, {});
  return {
    provider: "openrouter",
    providerName: preset.name,
    model,
    baseUrl: preset.baseUrl,
    apiKey,
    apiKeySource: "env",
    capabilities: capabilitiesFor("openrouter", model),
    price: { ...price, cacheRead: price.cacheRead ?? price.input * 0.1 },
    overrides: { vision: null, tools: null, structured: null, prices: false },
  };
}

export async function loadStoredAiConfig(): Promise<{ config: StoredAiConfig; updatedAt: Date; updatedBy: string | null } | null> {
  const [row] = await db.select().from(platformSettings).where(eq(platformSettings.key, AI_SETTING_KEY));
  if (!row) return null;
  return { config: row.value as unknown as StoredAiConfig, updatedAt: row.updatedAt, updatedBy: row.updatedBy };
}

export async function resolveAiConfig(stored?: { config: StoredAiConfig; updatedAt: Date | null; updatedBy: string | null } | null): Promise<ResolvedConfig> {
  const saved = stored === undefined ? await loadStoredAiConfig() : stored;
  const source = saved ? "admin" : fromEnv() ? "env" : "none";
  const config = saved?.config ?? fromEnv();
  if (!config) {
    return { source: "none", primary: null, vision: null, reason: "AI is turned off on this server (AI_PROVIDER=none)", updatedAt: null, updatedBy: null };
  }
  const fromAdmin = source === "admin";
  const primary = resolveModel(fromAdmin ? config.primary : envGenericKey(config.primary, "primary"), "primary", fromAdmin);
  const vision = config.vision ? resolveModel(fromAdmin ? config.vision : envGenericKey(config.vision, "vision"), "vision", fromAdmin) : null;
  return {
    source,
    primary: typeof primary === "string" ? null : primary,
    vision: vision && typeof vision !== "string" ? vision : null,
    reason: typeof primary === "string" ? primary : null,
    updatedAt: saved?.updatedAt ?? null,
    updatedBy: saved?.updatedBy ?? null,
  };
}

export type ProviderDeps = { fetch?: typeof fetch };

/** A client for one resolved model. */
export function buildProvider(resolved: ResolvedModel, deps: ProviderDeps = {}): AiProvider {
  if (resolved.provider === "anthropic") {
    return new AnthropicProvider({
      apiKey: resolved.apiKey ?? undefined,
      model: resolved.model,
      baseUrl: resolved.baseUrl ?? undefined,
      timeoutMs: 60_000,
      maxRetries: 2,
    });
  }
  return new OpenAiCompatibleProvider({
    provider: resolved.provider,
    baseUrl: resolved.baseUrl as string,
    apiKey: resolved.apiKey,
    model: resolved.model,
    capabilities: resolved.capabilities,
    price: resolved.price,
    // The older deepseek-chat/-reasoner cap answers at 8K; the V4 models don't.
    maxOutputTokens: resolved.provider === "deepseek" && /^deepseek-(chat|reasoner)$/.test(resolved.model) ? 8_192 : 16_000,
    fetch: deps.fetch,
    headers: resolved.provider === "openrouter" ? { "HTTP-Referer": env.APP_URL, "X-Title": "FinWise" } : undefined,
  });
}

/** What the rest of the server may know about AI without asking the database (health, admin overview). */
export const aiRuntime = { provider: "none", model: null as string | null, available: false, source: "none" as ResolvedConfig["source"] };

/**
 * The AI_PROVIDER the gateway calls. It holds the active configuration (saved
 * in Admin → AI, or from .env), builds the client for it, and routes each call:
 * screenshots and PDFs to a model that can read them, everything else to the
 * primary model. It reloads every 30 seconds so other processes (workers) pick
 * up an admin's change, and at once in the process that saved it.
 */
export class RoutingProvider implements AiProvider {
  private readonly logger = new Logger("AiProvider");
  private config: ResolvedConfig = { source: "none", primary: null, vision: null, reason: "AI is starting", updatedAt: null, updatedBy: null };
  private primary: AiProvider = new NoopProvider("AI is starting");
  private vision: AiProvider | null = null;
  private fallback: AiProvider | null = null;
  private fallbackInfo: { provider: string; model: string; capabilities: ResolvedModel["capabilities"] } | null = null;
  private timer: NodeJS.Timeout | null = null;
  private loaded = false;

  constructor(private readonly deps: ProviderDeps = {}) {}

  get name() {
    return this.config.primary?.provider ?? "none";
  }
  get model() {
    return this.config.primary?.model ?? null;
  }
  get available() {
    return this.config.primary !== null;
  }
  get unavailableReason() {
    return this.config.reason;
  }
  get resolved(): ResolvedConfig {
    return this.config;
  }

  async refresh(): Promise<ResolvedConfig> {
    try {
      this.apply(await resolveAiConfig());
    } catch (error) {
      this.logger.warn(`Could not load the saved AI configuration: ${error instanceof Error ? error.message : String(error)}`);
      // A database hiccup keeps the last good configuration; on the first load, .env stands in.
      if (!this.loaded) this.apply(await resolveAiConfig(null));
    }
    return this.config;
  }

  apply(config: ResolvedConfig) {
    this.loaded = true;
    const changed = JSON.stringify(summary(config)) !== JSON.stringify(summary(this.config));
    this.config = config;
    this.primary = config.primary ? buildProvider(config.primary, this.deps) : new NoopProvider(config.reason ?? "AI is not configured");
    this.vision = config.vision ? buildProvider(config.vision, this.deps) : null;
    const fallback = config.primary ? envFallbackModel(config.primary) : null;
    this.fallback = fallback ? buildProvider(fallback, this.deps) : null;
    this.fallbackInfo = fallback ? { provider: fallback.provider, model: fallback.model, capabilities: fallback.capabilities } : null;
    Object.assign(aiRuntime, { provider: this.name, model: this.model, available: this.available, source: config.source });
    if (changed) {
      this.logger.log(
        config.primary
          ? `AI: ${config.primary.providerName} · ${config.primary.model}${config.vision ? ` (images: ${config.vision.providerName} · ${config.vision.model})` : ""}${fallback ? ` (fallback: ${fallback.providerName} · ${fallback.model})` : ""} [${config.source}]`
          : `AI off: ${config.reason}`,
      );
    }
  }

  /** Keeps other processes in step with an admin's change. */
  startPolling(intervalMs = 30_000) {
    if (this.timer) return;
    this.timer = setInterval(() => void this.refresh(), intervalMs);
    this.timer.unref();
  }

  stopPolling() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  /** The model that can read this input, or a plain explanation of why none can. */
  private reader(input: ExtractInput): AiProvider {
    if (input.kind === "text") return this.primary;
    const need = input.kind === "pdf" ? "pdf" : "vision";
    const primary = this.config.primary;
    if (primary?.capabilities[need]) return this.primary;
    if (this.vision && this.config.vision?.capabilities[need]) return this.vision;
    const what = input.kind === "pdf" ? "PDFs" : "images";
    throw new AiProviderError(
      "bad_request",
      `${primary ? `${primary.providerName} · ${primary.model}` : "The configured model"} can't read ${what}. Add a model that can in Admin → AI, or enter the details by hand.`,
    );
  }

  /** The fallback for this input, when it can read the input at all. */
  private fallbackReader(input: ExtractInput): AiProvider | null {
    if (!this.fallback || !this.fallbackInfo) return null;
    if (input.kind === "text") return this.fallback;
    const need = input.kind === "pdf" ? "pdf" : "vision";
    return this.fallbackInfo.capabilities[need] ? this.fallback : null;
  }

  /**
   * Runs a call on the primary provider and, when it fails at the transport
   * level (rate limit, overload, timeout, dropped connection), retries once on
   * the configured OpenRouter fallback. Model-level failures (a refusal, an
   * invalid answer) are returned as they are.
   */
  private async withFallback<T>(label: string, call: () => Promise<ProviderResult<T>>, retry: (() => Promise<ProviderResult<T>>) | null) {
    try {
      return await call();
    } catch (error) {
      if (!retry || !this.fallbackInfo || !(error instanceof AiProviderError) || !error.retryable) throw error;
      this.logger.warn(`${label} failed on ${this.name} (${error.kind}: ${error.message}); retrying on ${this.fallbackInfo.provider} · ${this.fallbackInfo.model}`);
      const result = await retry();
      return { ...result, provider: this.fallbackInfo.provider };
    }
  }

  async extract(input: ExtractInput): Promise<ProviderResult<ExtractionOutput>> {
    const primary = this.reader(input);
    const fallback = this.fallbackReader(input);
    return this.withFallback("extract", () => primary.extract(input), fallback ? () => fallback.extract(input) : null);
  }

  classify(input: ClassifyInput): Promise<ProviderResult<ClassificationOutput>> {
    return this.withFallback("classify", () => this.primary.classify(input), this.fallback ? () => (this.fallback as AiProvider).classify(input) : null);
  }

  generate(input: GenerateInput): Promise<ProviderResult<{ text: string }>> {
    return this.withFallback("generate", () => this.primary.generate(input), this.fallback ? () => (this.fallback as AiProvider).generate(input) : null);
  }

  async runWithTools(input: ToolRunInput): Promise<ProviderResult<ToolRunOutput>> {
    if (this.config.primary && !this.config.primary.capabilities.tools) {
      throw new AiProviderError("bad_request", `${this.config.primary.model} can't use tools; the copilot answers from its built-in readings instead.`);
    }
    const fallback = this.fallback && this.fallbackInfo?.capabilities.tools ? this.fallback : null;
    return this.withFallback("copilot", () => this.primary.runWithTools(input), fallback ? () => (fallback as AiProvider).runWithTools(input) : null);
  }
}

function summary(config: ResolvedConfig) {
  const one = (model: ResolvedModel | null) => (model ? [model.provider, model.model, model.baseUrl, model.apiKeySource, model.capabilities] : null);
  return [config.source, one(config.primary), one(config.vision), config.reason];
}
