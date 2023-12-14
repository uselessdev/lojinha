import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { integer, index, timestamp, primaryKey, text, serial, pgTable } from "drizzle-orm/pg-core";
import { images } from ".";

export const collections = pgTable(
  "collections",
  {
    id: serial("id").primaryKey(),
    eid: text("external_id")
      .$defaultFn(() => `col_${createId()}`)
      .notNull(),
    store: text("store").notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  },
  (table) => ({
    eid: index("eid").on(table.eid),
    slug: index("slug").on(table.slug),
  }),
);

export const collectionsRelations = relations(collections, ({ many }) => ({
  parents: many(collectionsToCollections, { relationName: "child" }),
  children: many(collectionsToCollections, { relationName: "parent" }),
  images: many(images),
}));

export const collectionsToCollections = pgTable(
  "_CollectionsToCollections",
  {
    parent: integer("parent")
      .notNull()
      .references(() => collections.id),
    child: integer("child")
      .notNull()
      .references(() => collections.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.parent, t.child] }),
  }),
);

export const collectionsToCollectionsRelations = relations(collectionsToCollections, ({ one }) => ({
  parent: one(collections, {
    fields: [collectionsToCollections.parent],
    references: [collections.id],
    relationName: "parent",
  }),
  child: one(collections, {
    fields: [collectionsToCollections.child],
    references: [collections.id],
    relationName: "child",
  }),
}));

export type Collection = typeof collections.$inferSelect;
