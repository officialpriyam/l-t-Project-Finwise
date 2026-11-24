import { beforeEach, describe, expect, it, vi } from "vitest";

const heartbeat = vi.hoisted(() => vi.fn(async () => true));

vi.mock("../../src/domains/ops/heartbeat.js", () => ({ recordHeartbeat: heartbeat }));

import { WorkerService } from "../../src/platform/jobs/worker.service.js";

function setup() {
  const events = { dispatchPending: vi.fn() };
  const jobs = { workerId: "test-worker", runDue: vi.fn() };
  const worker = new WorkerService(events as never, jobs as never);
  return { events, jobs, worker };
}

beforeEach(() => {
  heartbeat.mockClear();
});

describe("worker draining", () => {
  it("keeps polling the durable queue until a pass finds no work", async () => {
    const { events, jobs, worker } = setup();
    events.dispatchPending.mockResolvedValueOnce(2).mockResolvedValueOnce(1).mockResolvedValueOnce(0);
    jobs.runDue.mockResolvedValueOnce(1).mockResolvedValueOnce(0).mockResolvedValueOnce(0);

    await expect(worker.drain()).resolves.toEqual({ events: 3, jobs: 1 });
    expect(events.dispatchPending).toHaveBeenCalledTimes(3);
    expect(jobs.runDue).toHaveBeenCalledTimes(3);
    expect(heartbeat).toHaveBeenCalledTimes(3);
  });

  it("does not start a pass after its deadline", async () => {
    const { events, jobs, worker } = setup();
    await expect(worker.drain(0)).resolves.toEqual({ events: 0, jobs: 0 });
    expect(events.dispatchPending).not.toHaveBeenCalled();
    expect(jobs.runDue).not.toHaveBeenCalled();
  });

  it("surfaces infrastructure failures to cron", async () => {
    const { events, worker } = setup();
    events.dispatchPending.mockRejectedValue(new Error("database unavailable"));
    await expect(worker.drain()).rejects.toThrow("database unavailable");
  });

  it("keeps the long-running timer path resilient", async () => {
    const { events, jobs, worker } = setup();
    events.dispatchPending.mockRejectedValue(new Error("database unavailable"));
    jobs.runDue.mockResolvedValue(0);
    await expect(worker.tick()).resolves.toEqual({ events: 0, jobs: 0 });
  });
});
