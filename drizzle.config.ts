import "dotenv/config";

import { defineConfig } from "drizzle-kit";

import { databaseUrl } from "./src/config/env.js";

export default defineConfig({
  schema: "./db/index.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
