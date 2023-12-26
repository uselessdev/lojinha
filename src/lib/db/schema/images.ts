import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { collections } from "./collections";
import { products } from "./products";

export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  eid: text("external_id")
    .$defaultFn(() => `img_${createId()}`)
    .notNull(),
  store: text("store").notNull(),
  key: text("key").notNull(),
  url: text("url").notNull(),
  cid: integer("collection_id"),
  pid: integer("product_id"),
});

export const imagesRelations = relations(images, ({ one }) => ({
  collection: one(collections, {
    fields: [images.cid],
    references: [collections.id],
  }),

  product: one(products, {
    fields: [images.pid],
    references: [products.id],
  }),
}));

export type Image = typeof images.$inferSelect;
