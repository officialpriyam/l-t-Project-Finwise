import { env } from "../../kernel/env.js";

/** True in `pnpm worker`, or in the API process when RUN_WORKER_IN_PROCESS. */
export function runsWorker(): boolean {
  if (process.env.EW_DISABLE_WORKER === "1") return false;
  return process.env.EW_WORKER_PROCESS === "1" || env.RUN_WORKER_IN_PROCESS;
}

export function workerMode(): "in-process" | "cron" | "external" {
  if (process.env.VERCEL === "1" && env.CRON_SECRET) return "cron";
  return runsWorker() ? "in-process" : "external";
}
