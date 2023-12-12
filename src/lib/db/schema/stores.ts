import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { pgTable, serial, text, timestamp, index } from "drizzle-orm/pg-core";
import { emails } from "./emails";

export const stores = pgTable(
  "stores",
  {
    id: serial("id").primaryKey(),
    eid: text("external_id")
      .$defaultFn(() => `str_${createId()}`)
      .notNull(),
    store: text("store").notNull().unique(),
    name: text("name").notNull(),
    url: text("url"),
    cnpj: text("cnpj").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  },
  (table) => ({
    eid: index("eid").on(table.eid),
    storeidx: index("storeidx").on(table.store),
    cnpjidx: index("cnpjidx").on(table.cnpj),
  }),
);

export const storesRelations = relations(stores, ({ many }) => ({
  emails: many(emails),
}));

export type Store = typeof stores.$inferSelect;
