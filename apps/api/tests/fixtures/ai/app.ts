import type { INestApplicationContext, Type } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppModule } from "../../../src/bootstrap/app.module.js";
import { closeDb } from "../../../src/platform/data/index.js";
import { AI_PROVIDER, type AiProvider } from "../../../src/domains/intelligence/gateway/types.js";

/** The whole application with the AI provider replaced (no network, ever). */
export async function aiApp(provider: AiProvider): Promise<INestApplicationContext & { service<T>(type: Type<T>): T }> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(AI_PROVIDER)
    .useValue(provider)
    .compile();
  await moduleRef.init();
  return Object.assign(moduleRef, {
    service: <T>(type: Type<T>) => moduleRef.get(type, { strict: false }),
  });
}

export async function closeAiApp(app: INestApplicationContext | undefined) {
  if (app) await app.close();
  await closeDb();
}
