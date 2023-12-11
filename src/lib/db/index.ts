import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "~/env.mjs";
import * as schema from "./schema";

const sql = postgres(env.DATABASE_URL, { ssl: true });

export const db = drizzle(sql, {
  schema,
  logger: env.NODE_ENV === "development",
});

export * from "drizzle-orm";
export * from "./schema";
