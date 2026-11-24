import { hostname } from "node:os";
import { Inject, Injectable, Logger, type OnApplicationBootstrap } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { CronJob, CronTime } from "cron";
import { lt } from "drizzle-orm";
import { db } from "../data/index.js";
import { schedulerRuns, workspaces } from "../data/schema/index.js";
import { runsWorker } from "./worker-mode.js";

type Task = { name: string; cron: string; schedule: CronTime; run: () => Promise<unknown>; description: string };

/** A firing's slot: its scheduled time to the minute (UTC), the same on every instance. */
export function slotFor(at: Date): Date {
  const slot = new Date(at.getTime());
  slot.setUTCSeconds(0, 0);
  return slot;
}

/**
 * Periodic tasks, registered by domain modules in onModuleInit:
 *
 *   scheduler.register("reminders.scan", "0 * * * *", "Renewal reminders", () => ...)
 *
 * Crons start wherever the worker runs, which may be several processes (API
 * instances with RUN_WORKER_IN_PROCESS, `pnpm worker` replicas). Each firing
 * claims its slot in `scheduler_run` first; only the process whose insert
 * wins runs the task, so a schedule runs once per slot however many
 * instances there are. "Run now" from the admin panel calls runTask directly
 * and always runs. Tasks should enqueue jobs (with dedupe keys) rather than
 * do heavy work inline.
 */
@Injectable()
export class SchedulerService implements OnApplicationBootstrap {
  private readonly logger = new Logger("Scheduler");
  private readonly tasks = new Map<string, Task>();
  private readonly lastRun = new Map<string, { at: Date; ok: boolean; error?: string }>();
  readonly instance = `${hostname()}:${process.pid}`;

  constructor(@Inject(SchedulerRegistry) private readonly registry: SchedulerRegistry) {}

  register(name: string, cron: string, description: string, run: () => Promise<unknown>) {
    this.tasks.set(name, { name, cron, schedule: new CronTime(cron, "UTC"), run, description });
  }

  onApplicationBootstrap() {
    if (!runsWorker()) return;
    for (const task of this.tasks.values()) {
      const job: CronJob = CronJob.from({
        cronTime: task.cron,
        timeZone: "UTC",
        onTick: () => void this.runScheduled(task.name, job.lastDate() ?? new Date()),
      });
      this.registry.addCronJob(task.name, job);
      job.start();
    }
    this.logger.log(`${this.tasks.size} scheduled tasks active`);
  }

  /** Runs tasks due in the current UTC minute, or the previous minute at a boundary. */
  async runDue(now = new Date()): Promise<string[]> {
    const current = slotFor(now);
    const previous = new Date(current.getTime() - 60_000);
    const claimed: string[] = [];
    for (const task of this.tasks.values()) {
      const slot = [current, previous].find(
        (candidate) => task.schedule.getNextDateFrom(new Date(candidate.getTime() - 1), "UTC").toMillis() === candidate.getTime(),
      );
      if (!slot) continue;
      if (await this.runScheduled(task.name, slot)) claimed.push(task.name);
    }
    return claimed;
  }

  /**
   * A cron firing: claims the slot, and runs the task only if this instance
   * got it. Returns whether it ran here.
   */
  async runScheduled(name: string, firedAt: Date = new Date()): Promise<boolean> {
    const slot = slotFor(firedAt);
    let claimed: boolean;
    try {
      claimed = await this.claim(name, slot);
    } catch (error) {
      // Without the database no task could do anything useful anyway.
      this.logger.warn(`Task ${name} skipped: could not claim ${slot.toISOString()} (${error instanceof Error ? error.message : String(error)})`);
      return false;
    }
    if (!claimed) {
      this.logger.debug(`Task ${name} for ${slot.toISOString()} already started on another instance`);
      return false;
    }
    await this.runTask(name);
    return true;
  }

  /** Inserts (name, slot); true only for the one instance whose insert lands. */
  async claim(name: string, slot: Date): Promise<boolean> {
    const rows = await db.insert(schedulerRuns).values({ name, slot, instance: this.instance }).onConflictDoNothing().returning({ name: schedulerRuns.name });
    return rows.length > 0;
  }

  /** Forgets claims older than `days` (they only matter while a slot is current). */
  async pruneRuns(days = 30): Promise<number> {
    const result = await db.delete(schedulerRuns).where(lt(schedulerRuns.slot, new Date(Date.now() - days * 86_400_000)));
    return result.rowCount ?? 0;
  }

  async runTask(name: string) {
    const task = this.tasks.get(name);
    if (!task) throw new Error(`Unknown task ${name}`);
    try {
      await task.run();
      this.lastRun.set(name, { at: new Date(), ok: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.lastRun.set(name, { at: new Date(), ok: false, error: message });
      this.logger.warn(`Task ${name} failed: ${message}`);
    }
  }

  list() {
    return [...this.tasks.values()].map((task) => ({
      name: task.name,
      cron: task.cron,
      description: task.description,
      lastRun: this.lastRun.get(task.name) ?? null,
    }));
  }

  /** Ids of every workspace, for tasks that fan out one job per workspace. */
  async workspaceIds(): Promise<string[]> {
    const rows = await db.select({ id: workspaces.id }).from(workspaces);
    return rows.map((row) => row.id);
  }
}
