import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const provider = vi.hoisted(() => ({
  refresh: vi.fn(async () => undefined),
  startPolling: vi.fn(),
}));

vi.mock("../../src/domains/intelligence/gateway/router.provider.js", () => ({
  RoutingProvider: class {
    refresh = provider.refresh;
    startPolling = provider.startPolling;
  },
}));

import { createAiProvider } from "../../src/domains/intelligence/gateway/provider.factory.js";

beforeEach(() => {
  provider.refresh.mockClear();
  provider.startPolling.mockClear();
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("VERCEL", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("AI provider factory", () => {
  it("loads the initial configuration and polls on long-running hosts", async () => {
    await createAiProvider();
    expect(provider.refresh).toHaveBeenCalledTimes(1);
    expect(provider.startPolling).toHaveBeenCalledTimes(1);
  });

  it("does not start a polling timer on Vercel", async () => {
    vi.stubEnv("VERCEL", "1");
    await createAiProvider();
    expect(provider.refresh).toHaveBeenCalledTimes(1);
    expect(provider.startPolling).not.toHaveBeenCalled();
  });

  it("does not start a polling timer in tests", async () => {
    vi.stubEnv("NODE_ENV", "test");
    await createAiProvider();
    expect(provider.refresh).toHaveBeenCalledTimes(1);
    expect(provider.startPolling).not.toHaveBeenCalled();
  });
});
