import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";
import { products } from "./products";

export const options = pgTable("products_options", {
  id: serial("id").primaryKey(),
  eid: text("external_id")
    .$defaultFn(() => `pop_${createId()}`)
    .notNull(),
  pid: integer("product_id").notNull(),
  store: text("store").notNull(),
  name: text("name").notNull(),
  price: integer("price"),
  originalPrice: integer("original_price"),
  quantity: integer("quantity"),
  sku: text("sku"),
});

export const optionsRelations = relations(options, ({ one }) => ({
  product: one(products, {
    fields: [options.pid],
    references: [products.id],
  }),
}));

export type Option = typeof options.$inferSelect;
