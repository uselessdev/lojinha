import { z } from "zod";
import { and, db, eq, images } from "~/lib/db";

const imagesSchema = z.object({
  collection: z.number().optional(),
  product: z.number().optional(),
  key: z.string(),
  store: z.string(),
  url: z.string().url(),
});

export const Images = {
  create: async (data: z.input<typeof imagesSchema>) => {
    await db.insert(images).values({
      key: data.key,
      store: data.store,
      url: data.url,
      cid: data.collection,
      pid: data.product,
    });
  },

  remove: async (store: string, id: number) => {
    return db.delete(images).where(and(eq(images.id, id), eq(images.store, store)));
  },
};
