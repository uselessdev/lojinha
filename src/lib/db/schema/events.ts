import { index, jsonb, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const actions = pgEnum("event_action", [
  "CREATE_ACCOUNT",
  "CREATE_STORE",
  "UPDATE_STORE",
  "CREATE_COLLECTION",
  "UPDATE_COLLECTION",
  "ARCHIVE_COLLECTION",
  "RESTORE_COLLECTION",
  "DELETE_COLLECTION",
  "CREATE_KEY",
  "REVOKE_KEY",
]);

export const events = pgTable(
  "events",
  {
    id: serial("id").primaryKey(),
    eid: text("external_id")
      .$defaultFn(() => `evt_${createId()}`)
      .notNull(),
    payload: jsonb("payload").notNull(),
    actor: text("actor").notNull(),
    action: actions("action").notNull(),
    store: varchar("store"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  },
  (table) => ({
    eid: index("eid").on(table.eid),
    storeidx: index("storeidx").on(table.store),
    actoridx: index("actoridx").on(table.actor),
  }),
);

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;
