import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockedEnv = vi.hoisted(() => ({
  RUN_WORKER_IN_PROCESS: true,
  CRON_SECRET: undefined as string | undefined,
}));

vi.mock("../../src/kernel/env.js", () => ({ env: mockedEnv }));

import { runsWorker, workerMode } from "../../src/platform/jobs/worker-mode.js";

beforeEach(() => {
  vi.stubEnv("EW_DISABLE_WORKER", "");
  vi.stubEnv("EW_WORKER_PROCESS", "");
  vi.stubEnv("VERCEL", "");
  mockedEnv.RUN_WORKER_IN_PROCESS = true;
  mockedEnv.CRON_SECRET = undefined;
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("worker mode", () => {
  it("uses the in-process worker by default", () => {
    expect(runsWorker()).toBe(true);
    expect(workerMode()).toBe("in-process");
  });

  it("supports a separate worker process", () => {
    mockedEnv.RUN_WORKER_IN_PROCESS = false;
    vi.stubEnv("EW_WORKER_PROCESS", "1");
    expect(runsWorker()).toBe(true);
    expect(workerMode()).toBe("in-process");
  });

  it("reports external mode when no worker runs in this process", () => {
    mockedEnv.RUN_WORKER_IN_PROCESS = false;
    expect(runsWorker()).toBe(false);
    expect(workerMode()).toBe("external");
  });

  it("lets the serverless entrypoint disable every worker timer", () => {
    vi.stubEnv("EW_DISABLE_WORKER", "1");
    vi.stubEnv("EW_WORKER_PROCESS", "1");
    expect(runsWorker()).toBe(false);
    expect(workerMode()).toBe("external");
  });

  it("reports cron mode for a configured Vercel deployment", () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("EW_DISABLE_WORKER", "1");
    mockedEnv.CRON_SECRET = "test-cron-secret";
    expect(runsWorker()).toBe(false);
    expect(workerMode()).toBe("cron");
  });

  it("does not report cron mode without a cron secret", () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("EW_DISABLE_WORKER", "1");
    expect(workerMode()).toBe("external");
  });
});
