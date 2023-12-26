import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { index, integer, pgEnum, pgTable, primaryKey, serial, text, timestamp } from "drizzle-orm/pg-core";
import { collections } from "./collections";
import { options } from "./options";
import { variants } from "./variants";
import { images } from "./images";

export const status = pgEnum("product_status", ["ACTIVE", "DRAFT", "VALIDATION", "DISABLED"]);

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    eid: text("external_id")
      .$defaultFn(() => `pdt_${createId()}`)
      .notNull(),
    store: text("store").notNull(),
    status: status("status").default("DRAFT"),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),

    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  },
  (t) => ({
    eid: index("eid").on(t.eid),
    store: index("store").on(t.store),
    slug: index("slug").on(t.slug),
  }),
);

export const productsRelations = relations(products, ({ many }) => ({
  collections: many(productsToCollections),
  variants: many(variants),
  options: many(options),
  images: many(images),
}));

export const productsToCollections = pgTable(
  "_ProductsToCollections",
  {
    collection: integer("collection")
      .notNull()
      .references(() => collections.id),
    product: integer("product")
      .notNull()
      .references(() => products.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.collection, t.product] }),
  }),
);

export const collectionsToProductsRelations = relations(productsToCollections, ({ one }) => ({
  collection: one(collections, { fields: [productsToCollections.collection], references: [collections.id] }),
  product: one(products, { fields: [productsToCollections.product], references: [products.id] }),
}));

export type Product = typeof products.$inferSelect;
export type CreateProduct = typeof products.$inferInsert;
