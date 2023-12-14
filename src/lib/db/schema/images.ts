import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { collections } from ".";

export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  eid: text("external_id")
    .$defaultFn(() => `img_${createId()}`)
    .notNull(),
  store: text("store").notNull(),
  key: text("key").notNull(),
  url: text("url").notNull(),
  cid: integer("collection_id").notNull(),
});

export const imagesRelations = relations(images, ({ one }) => ({
  collection: one(collections, {
    fields: [images.cid],
    references: [collections.id],
  }),
}));

export type Image = typeof images.$inferSelect;
