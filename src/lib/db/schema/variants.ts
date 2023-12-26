import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";
import { products } from "./products";

export const variants = pgTable("products_variants", {
  id: serial("id").primaryKey(),
  eid: text("external_id")
    .$defaultFn(() => `pva_${createId()}`)
    .notNull(),
  pid: integer("product_id").notNull(),
  store: text("store").notNull(),
  name: text("name").notNull(),
  values: text("text").array(),
});

export const variantsRelations = relations(variants, ({ one }) => ({
  product: one(products, {
    fields: [variants.pid],
    references: [products.id],
  }),
}));

export type Variant = typeof variants.$inferSelect;
