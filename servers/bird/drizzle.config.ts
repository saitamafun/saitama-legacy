import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    ssl: "DEBUG" in process.env,
  },
  verbose: true,
  strict: true,
  out: "./drizzle"
});
