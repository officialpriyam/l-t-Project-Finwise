import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const storageConfig = vi.hoisted(() => ({
  loadStorageConfig: vi.fn(),
  envS3Settings: vi.fn(),
}));

vi.mock("../../src/platform/storage/storage-config.js", () => storageConfig);
vi.mock("../../src/kernel/env.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/kernel/env.js")>();
  return { ...actual, env: { ...actual.env, STORAGE_DRIVER: "local" } };
});

import { StorageService } from "../../src/platform/storage/storage.service.js";

function service() {
  return new StorageService({} as never, {} as never, {} as never);
}

beforeEach(() => {
  vi.stubEnv("VERCEL", "");
  storageConfig.loadStorageConfig.mockResolvedValue(null);
  storageConfig.envS3Settings.mockReturnValue(null);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("Vercel storage", () => {
  it("keeps local storage available on durable hosts", async () => {
    await expect(service().target()).resolves.toEqual({ backend: "local", prefix: null });
  });

  it("rejects ephemeral local uploads on Vercel with an actionable error", async () => {
    vi.stubEnv("VERCEL", "1");
    await expect(service().target()).rejects.toMatchObject({
      status: 503,
      code: "storage_unavailable",
      message: expect.stringMatching(/S3 or Cloudflare R2/),
    });
  });

  it("allows an Admin storage bucket on Vercel", async () => {
    vi.stubEnv("VERCEL", "1");
    storageConfig.loadStorageConfig.mockResolvedValue({ stored: { prefix: "receipts" }, settings: {}, problem: null });
    await expect(service().target()).resolves.toEqual({ backend: "admin", prefix: "receipts" });
  });
});
