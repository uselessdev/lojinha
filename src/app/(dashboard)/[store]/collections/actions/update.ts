"use server";

import { createServerAction } from "~/lib/actions/create-server-action";
import { collectionSchema } from "../schema";
import { z } from "zod";
import { Collections } from "~/repositories/collections";
import { svix } from "~/lib/svix";
import { formatters } from "~/lib/formatters";
import { revalidatePath } from "next/cache";

export const updateCollectionAction = createServerAction({
  schema: collectionSchema.extend({ id: z.number() }),
  handler: async ({ parents = [], ...payload }, ctx) => {
    try {
      const collection = await Collections.update({ ...payload, parents, store: ctx.store });

      if (collection && ctx.wh) {
        await svix.message.create(ctx.wh, {
          payload: {
            data: formatters.applyDataSpec(collection),
            type: "collection.update",
          },
          eventType: "collection.update",
        });
      }

      revalidatePath(`/${ctx.store}/collections`, "page");

      return { success: true, data: collection };
    } catch (error) {
      console.error(error);
      return { success: false, error: (error as Error).message };
    }
  },
});
