import { productSchema } from "~/app/(dashboard)/[store]/products/schema";
import {
  db,
  products,
  productsToCollections as pc,
  variants as pv,
  options as po,
  and,
  eq,
  images,
  ne,
  notInArray,
} from "~/lib/db";
import { formatters } from "~/lib/formatters";
import { Events } from "./events";
import { z } from "zod";
import { UTApi } from "uploadthing/server";
import { env } from "~/env.mjs";

export const utapi = new UTApi({ apiKey: env.UPLOADTHING_SECRET });

const productSchemaWithId = productSchema.required({ id: true });

export const Products = {
  all: async (store: string) => {
    const result = await db.query.products.findMany({
      where: (products, { eq }) => eq(products.store, store),
      columns: {
        id: true,
        eid: true,
        name: true,
        deletedAt: true,
      },
      with: {
        collections: {
          with: {
            collection: {
              columns: {
                eid: true,
                name: true,
              },
            },
          },
        },
        variants: {
          columns: {
            eid: true,
            name: true,
          },
        },
        options: {
          columns: {
            eid: true,
            name: true,
            price: true,
            quantity: true,
          },
        },
        images: {
          columns: {
            eid: true,
            key: true,
            url: true,
          },
          limit: 3,
        },
      },
    });

    return result.map(({ collections, ...product }) => ({
      ...product,
      collections: collections.map(({ collection }) => collection),
    }));
  },

  find: async (data: { eid: string; store: string }) => {
    const result = await db.query.products.findFirst({
      where: (product, { and, eq }) => and(eq(product.eid, data.eid), eq(product.store, data.store)),
      with: {
        collections: {
          with: {
            collection: true,
          },
        },
        variants: true,
        options: true,
        images: true,
      },
    });

    if (!result) {
      return null;
    }

    return {
      ...result,
      collections: (result?.collections ?? []).map(({ collection }) => collection),
    };
  },

  create: async (data: z.input<typeof productSchema>, store: string) => {
    const { variants = [], options = [], collections = [], price, originalPrice, quantity, sku, ...payload } = data;

    return db.transaction(async (tx) => {
      const [product] = await tx
        .insert(products)
        .values({ store, ...payload })
        .returning();

      if (collections.length > 0) {
        await tx.insert(pc).values(collections.map((collection) => ({ collection, product: product.id })));
      }

      if (variants.length <= 0) {
        await tx.insert(pv).values({
          name: "default",
          pid: product.id,
          store,
          values: ["default"],
        });

        await tx.insert(po).values({
          name: "default",
          pid: product.id,
          store,
          originalPrice: formatters.number(originalPrice ?? ""),
          price: formatters.number(price ?? ""),
          quantity,
          sku,
        });
      }

      if (variants.length > 0) {
        await tx.insert(pv).values(variants.map((variant) => ({ ...variant, pid: product.id, store })));
      }

      if (options.length > 0) {
        await tx.insert(po).values(
          options.map((option) => ({
            ...option,
            pid: product.id,
            store,
            price: formatters.number(option.price ?? ""),
            originalPrice: formatters.number(option.originalPrice ?? ""),
          })),
        );
      }

      await Events.create({ action: "CREATE_PRODUCT", payload: data });

      return product;
    });
  },

  update: async ({ product: payload, store }: { product: z.input<typeof productSchemaWithId>; store: string }) => {
    return db.transaction(async (tx) => {
      const {
        id: pid,
        collections = [],
        options = [],
        variants = [],
        originalPrice,
        price,
        quantity,
        sku,
        ...data
      } = payload;

      /** Handle Default Variants and Options */
      const variantsToCreate = variants.filter(({ id }) => !id);
      const optionsToCreate = options.filter(({ id }) => !id);

      const variantsToUpdate = variants.filter(({ id, name }) => Boolean(id) && name !== "default");
      const optionsToUpdate = options.filter(({ id, name }) => Boolean(id) && name !== "default");

      const defaultVariant = variants.find(({ name }) => name === "default");
      const defaultOption = options.find(({ name }) => name === "default");

      const variantsIds = variantsToUpdate.map((variant) => variant.id as number);
      const optionsIds = optionsToUpdate.map((option) => option.id as number);

      /** Handle delete variants and options that are not default and wasnt in the payload */
      await tx
        .delete(pv)
        .where(
          and(
            eq(pv.pid, pid),
            eq(pv.store, store),
            ne(pv.name, "default"),
            variantsIds.length > 0 ? notInArray(pv.id, variantsIds) : undefined,
          ),
        );

      await tx
        .delete(po)
        .where(
          and(
            eq(po.pid, pid),
            eq(po.store, store),
            ne(po.name, "default"),
            optionsIds.length > 0 ? notInArray(po.id, optionsIds) : undefined,
          ),
        );

      /** Handle with variants and options updates */
      for (const { id, ...variant } of variantsToUpdate) {
        await tx
          .update(pv)
          .set({ ...variant })
          .where(and(eq(pv.id, id as number), eq(pv.pid, pid), eq(pv.store, store)));
      }

      for (const { id, ...option } of optionsToUpdate) {
        await tx
          .update(po)
          .set({
            ...option,
            price: formatters.priceToNumberOrUndefined(option.price),
            originalPrice: formatters.priceToNumberOrUndefined(option.originalPrice),
          })
          .where(and(eq(po.id, id as number), eq(po.pid, pid), eq(po.store, store)));
      }

      /** Handle with new variants and options */
      if (variantsToCreate.length > 0) {
        if (defaultVariant) {
          await tx.delete(pv).where(and(eq(pv.id, defaultVariant.id as number), eq(pv.pid, pid)));
        }

        await tx.insert(pv).values(variantsToCreate.map((variant) => ({ ...variant, pid, store })));
      }

      if (optionsToCreate.length > 0) {
        if (defaultOption) {
          await tx.delete(po).where(and(eq(po.id, defaultOption.id as number), eq(po.pid, pid)));
        }

        await tx.insert(po).values(
          optionsToCreate.map((option) => ({
            ...option,
            pid,
            store,
            price: formatters.priceToNumberOrUndefined(option.price),
            originalPrice: formatters.priceToNumberOrUndefined(option.originalPrice),
          })),
        );
      }

      const shouldUpdateDefaultVariantAndOption =
        defaultVariant && defaultOption && !variantsToCreate.length && !optionsToCreate.length;

      if (shouldUpdateDefaultVariantAndOption) {
        await tx
          .update(po)
          .set({
            ...defaultOption,
            price: formatters.number(defaultOption.price ?? ""),
            originalPrice: formatters.number(defaultOption.originalPrice ?? ""),
          })
          .where(and(eq(po.id, defaultOption.id as number), eq(po.pid, pid), eq(po.store, store)));
      }

      const shouldCreateDefaultVariantsAndOptions =
        !defaultOption && !defaultVariant && !variantsToUpdate.length && !optionsToUpdate.length && price;

      if (shouldCreateDefaultVariantsAndOptions) {
        await tx.insert(pv).values({ name: "default", store, pid, values: ["default"] });

        await tx.insert(po).values({
          pid,
          store,
          quantity,
          sku,
          name: "default",
          price: formatters.number(price ?? 0),
          originalPrice: formatters.number(originalPrice ?? 0),
        });
      }

      /** Handle With Collections */
      if (collections.length <= 0) {
        await tx.delete(pc).where(and(eq(pc.product, pid)));
      }

      if (collections.length > 0) {
        await tx.delete(pc).where(and(eq(pc.product, pid), notInArray(pc.collection, collections)));

        await tx
          .insert(pc)
          .values(collections.map((collection) => ({ collection, product: pid })))
          .onConflictDoNothing();
      }

      const [product] = await tx
        .update(products)
        .set({ ...data, updatedAt: new Date() })
        .where(and(eq(products.id, pid), eq(products.store, store)))
        .returning();

      await Events.create({ action: "UPDATE_PRODUCT", payload });

      return product;
    });
  },

  archive: async (data: { id: number; store: string }) => {
    const [product] = await db
      .update(products)
      .set({ deletedAt: new Date() })
      .where(and(eq(products.id, data.id), eq(products.store, data.store)))
      .returning({ name: products.name, id: products.eid });

    await Events.create({ action: "ARCHIVE_PRODUCT", payload: data });

    return product;
  },

  restore: async (data: { id: number; store: string }) => {
    const [product] = await db
      .update(products)
      .set({ deletedAt: null })
      .where(and(eq(products.id, data.id), eq(products.store, data.store)))
      .returning({ name: products.name, id: products.eid });

    await Events.create({ action: "RESTORE_PRODUCT", payload: data });

    return product;
  },

  destroy: async (data: { id: number; store: string }) => {
    return db.transaction(async (tx) => {
      /** @TODO não permitir exclusão de produto se existir pedidos. */

      await tx.delete(pc).where(eq(pc.product, data.id));

      const imgs = await tx.delete(images).where(eq(images.pid, data.id)).returning({ key: images.key });

      if (imgs.length > 0) {
        await utapi.deleteFiles(imgs.map(({ key }) => key));
      }

      await tx.delete(pv).where(and(eq(pv.pid, data.id), eq(pv.store, data.store)));
      await tx.delete(po).where(and(eq(po.pid, data.id), eq(po.store, data.store)));

      const [product] = await tx
        .delete(products)
        .where(and(eq(products.id, data.id), eq(products.store, data.store)))
        .returning({ id: products.eid, name: products.name });

      await Events.create({ action: "DELETE_PRODUCT", payload: data });

      return product;
    });
  },
};
