import { CollectionSchema } from "~/app/(dashboard)/[store]/collections/schema";
import { Collection, and, collections, collectionsToCollections, db, eq, images, notInArray, or } from "~/lib/db";
import { Events } from "./events";
import { UTApi } from "uploadthing/server";
import { env } from "~/env.mjs";

export const utapi = new UTApi({ apiKey: env.UPLOADTHING_SECRET });

export const Collections = {
  all: async (store: string) => {
    const collections = await db.query.collections.findMany({
      where: (collection, { eq, and }) => and(eq(collection.store, store)),
      with: {
        parents: {
          with: {
            parent: true,
          },
        },
        images: true,
      },
      orderBy: (collection, { desc }) => desc(collection.createdAt),
    });

    return collections.map(({ parents, ...collection }) => ({
      ...collection,
      parents: parents.map(({ parent }) => parent),
    }));
  },

  _all: async (store: string, columns?: Partial<Record<keyof Collection, boolean>>, ignore: number[] = []) => {
    return await db.query.collections.findMany({
      where: (collection, { and, eq, notInArray }) =>
        and(eq(collection.store, store), (ignore ?? []).length > 0 ? notInArray(collection.id, ignore) : undefined),
      columns,
    });
  },

  create: async ({ parents, ...data }: CollectionSchema, store: string) => {
    return db.transaction(async (tx) => {
      const [collection] = await tx
        .insert(collections)
        .values({ ...data, store })
        .returning();

      if (parents.length > 0 && collection) {
        await tx.insert(collectionsToCollections).values(parents.map((parent) => ({ parent, child: collection.id })));
      }

      await Events.create({ action: "CREATE_COLLECTION", payload: { ...data, parents } });

      return collection;
    });
  },

  find: async (store: string, id: string) => {
    const collection = await db.query.collections.findFirst({
      where: (collection, { and, eq }) => and(eq(collection.store, store), eq(collection.eid, id)),
      with: {
        parents: {
          with: {
            parent: true,
          },
        },
        images: true,
      },
    });

    if (!collection) {
      return null;
    }

    return {
      ...collection,
      parents: collection?.parents.map(({ parent }) => parent) ?? ([] as Collection[]),
    };
  },

  update: async ({ parents, id, store, ...payload }: CollectionSchema & { id: number; store: string }) => {
    const collection = await db.transaction(async (tx) => {
      if (parents.length <= 0) {
        await tx.delete(collectionsToCollections).where(eq(collectionsToCollections.child, id));
      }

      if (parents.length > 0) {
        await tx
          .delete(collectionsToCollections)
          .where(and(eq(collectionsToCollections.child, id), notInArray(collectionsToCollections.parent, parents)));

        await tx
          .insert(collectionsToCollections)
          .values(parents.map((parent) => ({ parent, child: id })))
          .onConflictDoNothing();
      }

      const [result] = await tx
        .update(collections)
        .set({ ...payload, updatedAt: new Date() })
        .where(and(eq(collections.id, id), eq(collections.store, store)))
        .returning();

      await Events.create({
        action: "UPDATE_COLLECTION",
        payload: { parents, id, store, ...payload },
      });

      return result;
    });

    return collection;
  },

  archive: async (args: { id: number; store: string }) => {
    const [collection] = await db
      .update(collections)
      .set({ deletedAt: new Date() })
      .where(and(eq(collections.id, args.id), eq(collections.store, args.store)))
      .returning({ name: collections.name, eid: collections.eid });

    await Events.create({
      action: "ARCHIVE_COLLECTION",
      payload: args,
    });

    return collection;
  },

  restore: async (args: { id: number; store: string }) => {
    const [collection] = await db
      .update(collections)
      .set({ deletedAt: null })
      .where(and(eq(collections.id, args.id), eq(collections.store, args.store)))
      .returning({ name: collections.name, eid: collections.eid });

    await Events.create({
      action: "RESTORE_COLLECTION",
      payload: args,
    });

    return collection;
  },

  destroy: async (args: { id: number; store: string }) => {
    return db.transaction(async (tx) => {
      await tx
        .delete(collectionsToCollections)
        .where(or(eq(collectionsToCollections.parent, args.id), eq(collectionsToCollections.child, args.id)));

      const imgs = await tx.delete(images).where(eq(images.cid, args.id)).returning({ key: images.key });

      if (imgs.length > 0) {
        await utapi.deleteFiles(imgs.map(({ key }) => key));
      }

      const [collection] = await tx
        .delete(collections)
        .where(and(eq(collections.id, args.id), eq(collections.store, args.store)))
        .returning({ id: collections.id, name: collections.name, eid: collections.eid });

      await Events.create({
        action: "DELETE_COLLECTION",
        payload: args,
      });

      return collection;
    });
  },
};
