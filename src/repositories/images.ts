import { and, db, eq, images } from "~/lib/db";

export const Images = {
  create: async (args: { collection: number; key: string; store: string; url: string }) => {
    await db.insert(images).values({
      cid: args.collection,
      key: args.key,
      store: args.store,
      url: args.url,
    });
  },

  remove: async (store: string, id: number) => {
    return db.delete(images).where(and(eq(images.id, id), eq(images.store, store)));
  },
};
