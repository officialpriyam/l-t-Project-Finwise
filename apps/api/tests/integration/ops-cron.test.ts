import type { AddressInfo } from "node:net";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { Test } from "@nestjs/testing";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { AppModule } from "../../src/bootstrap/app.module.js";
import { JobsService } from "../../src/domains/ops/jobs.service.js";
import { env } from "../../src/kernel/env.js";
import { configureHttpServer } from "../../src/kernel/http-server.js";
import { closeDb, db } from "../../src/platform/data/index.js";
import { jobs } from "../../src/platform/data/schema/index.js";
import { SchedulerService } from "../../src/platform/jobs/scheduler.service.js";
import { resetDatabase } from "./harness.js";

const CRON_SECRET = "integration-cron-secret";
const cronEnvironment = vi.hoisted(() => {
  const previous = process.env.CRON_SECRET;
  process.env.CRON_SECRET = "integration-cron-secret";
  return { previous };
});

let app: NestExpressApplication;
let base: string;

async function call(method: string, path: string, headers: Record<string, string> = {}) {
  const response = await fetch(`${base}${path}`, { method, headers });
  const text = await response.text();
  return { status: response.status, body: (text ? JSON.parse(text) : null) as Record<string, unknown> };
}

beforeAll(async () => {
  await resetDatabase();
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  app = moduleRef.createNestApplication<NestExpressApplication>({ bodyParser: false, logger: false });
  configureHttpServer(app, { appUrl: env.APP_URL, trustProxy: "1" });
  await app.listen(0, "127.0.0.1");
  base = `http://127.0.0.1:${(app.getHttpServer().address() as AddressInfo).port}/api`;
});

afterAll(async () => {
  await app?.close();
  await closeDb();
  if (cronEnvironment.previous === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = cronEnvironment.previous;
});

describe("cron worker endpoint", () => {
  it("requires the Bearer secret without revealing it", async () => {
    expect((await call("GET", "/system/cron")).status).toBe(401);
    expect((await call("GET", "/system/cron", { authorization: "Bearer wrong-secret" })).status).toBe(401);
    expect((await call("GET", "/system/cron", { authorization: CRON_SECRET })).status).toBe(401);
  });

  it("runs due schedules, drains their jobs, and ignores duplicate deliveries", async () => {
    const scheduler = app.get(SchedulerService);
    const jobService = app.get(JobsService);
    let scheduleRuns = 0;
    let jobRuns = 0;

    scheduler.register("ops.cron-test", "* * * * *", "Cron integration test", async () => {
      scheduleRuns += 1;
      await jobService.enqueue("ops.cron-test", {}, { dedupeKey: "ops.cron-test" });
    });
    jobService.register("ops.cron-test", async () => {
      jobRuns += 1;
    });

    const first = await call("GET", "/system/cron", { authorization: `Bearer ${CRON_SECRET}` });
    expect(first.status).toBe(200);
    expect(first.body).toMatchObject({
      scheduled: expect.any(Number),
      tasks: expect.arrayContaining(["ops.cron-test"]),
      events: expect.any(Number),
      jobs: expect.any(Number),
    });
    expect(scheduleRuns).toBe(1);
    expect(jobRuns).toBe(1);
    expect(await db.select().from(jobs).where(eq(jobs.type, "ops.cron-test"))).toMatchObject([{ status: "succeeded", attempts: 1 }]);

    const duplicate = await call("GET", "/system/cron", { authorization: `Bearer ${CRON_SECRET}` });
    expect(duplicate.status).toBe(200);
    expect(duplicate.body).toMatchObject({ scheduled: 0, tasks: [], events: 0, jobs: 0 });
    expect(scheduleRuns).toBe(1);
    expect(jobRuns).toBe(1);
  });

  it("keeps the legacy header-authenticated tick endpoint", async () => {
    expect((await call("POST", "/system/tick")).status).toBe(401);
    const accepted = await call("POST", "/system/tick", { "x-cron-secret": CRON_SECRET });
    expect(accepted.status).toBe(200);
    expect(accepted.body).toMatchObject({ events: expect.any(Number), jobs: expect.any(Number) });
  });
});
