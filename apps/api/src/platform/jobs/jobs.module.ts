import { timingSafeEqual } from "node:crypto";
import { Controller, Get, Global, Headers, HttpCode, Inject, Module, type OnModuleInit, Post } from "@nestjs/common";
import { EventsService } from "../../domains/ops/events.service.js";
import { JobsService } from "../../domains/ops/jobs.service.js";
import { pruneRateLimits } from "../../domains/ops/rate-limit.js";
import { env } from "../../kernel/env.js";
import { unauthorized } from "../../kernel/errors.js";
import { Public } from "../../kernel/guards.js";
import { SchedulerService } from "./scheduler.service.js";
import { WorkerService } from "./worker.service.js";

function secretMatches(provided: string | undefined, expected: string | undefined): boolean {
  if (!provided || !expected) return false;
  const actual = Buffer.from(provided);
  const wanted = Buffer.from(expected);
  return actual.length === wanted.length && timingSafeEqual(actual, wanted);
}

@Controller("system")
export class SystemTickController {
  constructor(
    @Inject(WorkerService) private readonly worker: WorkerService,
    @Inject(SchedulerService) private readonly scheduler: SchedulerService,
  ) {}

  /** For hosts without a long-running worker: an external cron calls this. */
  @Post("tick")
  @Public()
  @HttpCode(200)
  tick(@Headers("x-cron-secret") secret: string | undefined) {
    if (!secretMatches(secret, env.CRON_SECRET)) throw unauthorized("Invalid cron secret");
    return this.worker.tick();
  }

  /** Vercel Cron: run due schedules, then drain the durable queue. */
  @Get("cron")
  @Public()
  async cron(@Headers("authorization") authorization: string | undefined) {
    if (!secretMatches(authorization, env.CRON_SECRET ? `Bearer ${env.CRON_SECRET}` : undefined)) throw unauthorized("Invalid cron secret");
    const scheduled = await this.scheduler.runDue();
    const worker = await this.worker.drain();
    return { scheduled: scheduled.length, tasks: scheduled, ...worker };
  }
}

@Global()
@Module({
  controllers: [SystemTickController],
  providers: [WorkerService, SchedulerService],
  exports: [WorkerService, SchedulerService],
})
export class JobsModule implements OnModuleInit {
  constructor(
    @Inject(SchedulerService) private readonly scheduler: SchedulerService,
    @Inject(JobsService) private readonly jobs: JobsService,
    @Inject(EventsService) private readonly events: EventsService,
  ) {}

  onModuleInit() {
    this.scheduler.register("system.prune", "30 3 * * *", "Prune finished jobs and delivered events", async () => {
      await this.jobs.prune();
      await this.events.prune();
    });
    this.scheduler.register("system.prune-ops", "45 3 * * *", "Prune schedule claims older than 30 days and expired rate-limit counters", () =>
      this.pruneOps(),
    );
  }

  async pruneOps() {
    const schedulerRuns = await this.scheduler.pruneRuns(30);
    const rateLimits = await pruneRateLimits(24);
    return { schedulerRuns, rateLimits };
  }
}
