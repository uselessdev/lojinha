import { CollectionSchema } from "~/app/(dashboard)/collections/schema";
import {
  Collection,
  and,
  collections,
  collectionsToCollections,
  db,
  eq,
  images,
  isNull,
  notInArray,
  or,
} from "~/lib/db";
import { Events } from "./events";
import { UTApi } from "uploadthing/server";
import { env } from "~/env.mjs";
import { auth } from "@clerk/nextjs";

export const utapi = new UTApi({ apiKey: env.UPLOADTHING_SECRET });

export const Collections = {
  all: async () => {
    const { orgId: store } = auth();

    const collections = await db.query.collections.findMany({
      where: (collection, { eq, and }) => and(eq(collection.store, String(store))),
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

  _all: async (columns?: Partial<Record<keyof Collection, boolean>>, ignore: number[] = []) => {
    const { orgId: store } = auth();

    return await db.query.collections.findMany({
      where: (collection, { and, eq, notInArray }) =>
        and(
          eq(collection.store, String(store)),
          (ignore ?? []).length > 0 ? notInArray(collection.id, ignore) : undefined,
          isNull(collections.deletedAt),
        ),
      columns,
    });
  },

  create: async ({ parents, ...data }: CollectionSchema) => {
    const { orgId: store } = auth();

    return db.transaction(async (tx) => {
      const [collection] = await tx
        .insert(collections)
        .values({ ...data, store: String(store) })
        .returning();

      if (parents.length > 0 && collection) {
        await tx.insert(collectionsToCollections).values(parents.map((parent) => ({ parent, child: collection.id })));
      }

      await Events.create({ action: "CREATE_COLLECTION", payload: { ...data, parents } });

      return collection;
    });
  },

  find: async (id: string) => {
    const { orgId: store } = auth();

    const collection = await db.query.collections.findFirst({
      where: (collection, { and, eq }) => and(eq(collection.store, String(store)), eq(collection.eid, id)),
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

  update: async ({ parents, id, ...payload }: CollectionSchema & { id: number }) => {
    const { orgId: store } = auth();

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
        .where(and(eq(collections.id, id), eq(collections.store, String(store))))
        .returning();

      await Events.create({
        action: "UPDATE_COLLECTION",
        payload: { parents, id, store, ...payload },
      });

      return result;
    });

    return collection;
  },

  archive: async (data: { id: number }) => {
    const { orgId: store } = auth();

    const [collection] = await db
      .update(collections)
      .set({ deletedAt: new Date() })
      .where(and(eq(collections.id, data.id), eq(collections.store, String(store))))
      .returning({ name: collections.name, eid: collections.eid });

    await Events.create({
      action: "ARCHIVE_COLLECTION",
      payload: data,
    });

    return collection;
  },

  restore: async (data: { id: number }) => {
    const { orgId: store } = auth();

    const [collection] = await db
      .update(collections)
      .set({ deletedAt: null })
      .where(and(eq(collections.id, data.id), eq(collections.store, String(store))))
      .returning({ name: collections.name, eid: collections.eid });

    await Events.create({
      action: "RESTORE_COLLECTION",
      payload: data,
    });

    return collection;
  },

  destroy: async (data: { id: number }) => {
    const { orgId: store } = auth();

    return db.transaction(async (tx) => {
      await tx
        .delete(collectionsToCollections)
        .where(or(eq(collectionsToCollections.parent, data.id), eq(collectionsToCollections.child, data.id)));

      const imgs = await tx.delete(images).where(eq(images.cid, data.id)).returning({ key: images.key });

      if (imgs.length > 0) {
        await utapi.deleteFiles(imgs.map(({ key }) => key));
      }

      const [collection] = await tx
        .delete(collections)
        .where(and(eq(collections.id, data.id), eq(collections.store, String(store))))
        .returning({ id: collections.id, name: collections.name, eid: collections.eid });

      await Events.create({
        action: "DELETE_COLLECTION",
        payload: data,
      });

      return collection;
    });
  },
};
