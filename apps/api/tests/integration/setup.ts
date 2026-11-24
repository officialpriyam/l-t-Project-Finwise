import "../../src/kernel/load-env.js";

// Point the app at the test database before any module reads DATABASE_URL.
// Parallel runners (one per developer or agent) set DATABASE_URL_TEST to
// their own database so one run never truncates another's data.
const testUrl = process.env.DATABASE_URL_TEST;
if (!testUrl) throw new Error("DATABASE_URL_TEST must be set for integration tests");
if (testUrl === process.env.DATABASE_URL && !testUrl.includes("test")) {
  throw new Error("Refusing to run integration tests against the development database");
}
process.env.DATABASE_URL = testUrl;
process.env.EW_DISABLE_WORKER = "1";
process.env.NODE_ENV = "test";
// Never let a developer's live .env keys turn integration tests into provider calls.
process.env.AI_PROVIDER = "none";
process.env.AI_VISION_PROVIDER = "none";
process.env.OPENROUTER_FALLBACK_MODEL = "";
