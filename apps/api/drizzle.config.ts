import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: "../../.env", quiet: true });

export default defineConfig({
  out: "./drizzle",
  schema: "./src/platform/data/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://finwise:finwise@localhost:5436/finwise",
  },
  strict: true,
  verbose: true,
});
