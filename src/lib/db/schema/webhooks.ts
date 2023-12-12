import { index, pgTable, serial, text } from "drizzle-orm/pg-core";

export const webhooks = pgTable(
  "webhooks",
  {
    id: serial("id").primaryKey(),
    store: text("store"),
    sid: text("sid"),
  },
  (table) => ({
    sididx: index("sididx").on(table.sid),
  }),
);

export type WebhookPayload = typeof webhooks.$inferInsert;
