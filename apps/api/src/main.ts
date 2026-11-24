import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./bootstrap/app.module.js";
import { env } from "./kernel/env.js";
import { reportError } from "./kernel/error-reporter.js";
import { configureHttpServer } from "./kernel/http-server.js";
import { AppLogger, logLevelsFor } from "./kernel/logger.js";

// Vercel functions cannot keep worker or scheduler timers alive.
process.env.EW_DISABLE_WORKER = "1";

const logger = new AppLogger({ format: env.LOG_FORMAT, levels: logLevelsFor(env.NODE_ENV) });

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false, logger });
  configureHttpServer(app, { appUrl: env.APP_URL, trustProxy: env.TRUST_PROXY, logger });
  await app.listen(process.env.PORT ?? env.API_PORT);
  logger.log("FinWise API ready", "Bootstrap");
}

bootstrap().catch(async (error: unknown) => {
  logger.fatal(`API failed to start: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : undefined, "Bootstrap");
  await reportError(error, { level: "fatal", mechanism: "bootstrap", handled: false, tags: { service: "api" } });
  process.exit(1);
});
