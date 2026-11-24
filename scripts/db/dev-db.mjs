/**
 * Local PostgreSQL for development without Docker.
 *
 *   pnpm db:local        start (init + create databases + keep running)
 *
 * Data lives in .local/pgdata and survives restarts. Stop with Ctrl+C.
 */
import path from "node:path";
import EmbeddedPostgres from "embedded-postgres";

const DATA_DIR = path.resolve(".local/pgdata");
const PORT = Number(process.env.PGDATA_PORT ?? 5436);
const USER = "finwise";
const PASSWORD = "finwise";
const DATABASES = ["finwise", "finwise_test"];

const pg = new EmbeddedPostgres({
  databaseDir: DATA_DIR,
  user: USER,
  password: PASSWORD,
  port: PORT,
  persistent: true,
  autoRehydrateSymlinks: true,
  // The app stores Bangla amounts (৳) and other non-Latin text: force UTF-8.
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
});

await pg.initialise();
await pg.start();

for (const name of DATABASES) {
  try {
    await pg.createDatabase(name);
    console.log(`created database ${name}`);
  } catch {
    console.log(`database ${name} already exists`);
  }
}

console.log(`Postgres ready at postgres://${USER}:${PASSWORD}@localhost:${PORT} (Ctrl+C to stop)`);

let stopping = false;
const shutdown = async () => {
  if (stopping) return;
  stopping = true;
  await pg.stop().catch(() => undefined);
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Keep the event loop alive; embedded-postgres manages the server process.
setInterval(() => {}, 1 << 30);
