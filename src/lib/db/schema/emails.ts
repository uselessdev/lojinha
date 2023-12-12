import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { integer, index, text, serial, pgTable } from "drizzle-orm/pg-core";
import { stores } from "./stores";

export const emails = pgTable(
  "emails",
  {
    id: serial("id").primaryKey(),
    eid: text("external_id")
      .$defaultFn(() => `eml_${createId()}`)
      .notNull(),
    store: text("store").notNull(),
    storeId: integer("store_id").notNull(),
    address: text("address").notNull().unique(),
  },
  (table) => ({
    eid: index("eid").on(table.eid),
    storeidx: index("storeidx").on(table.store),
    addressidx: index("addressidx").on(table.address),
  }),
);

export const emailsRelations = relations(emails, ({ one }) => ({
  store: one(stores, {
    fields: [emails.storeId],
    references: [stores.id],
  }),
}));

export type Email = typeof emails.$inferSelect;
