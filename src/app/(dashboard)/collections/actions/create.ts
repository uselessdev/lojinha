"use server";

import { revalidatePath } from "next/cache";
import { createServerAction } from "~/lib/actions/create-server-action";
import { svix } from "~/lib/svix";
import { collectionSchema } from "../schema";
import { Collections } from "~/repositories/collections";
import { formatters } from "~/lib/formatters";

export const createCollectionAction = createServerAction({
  schema: collectionSchema,
  handler: async ({ parents = [], ...payload }, ctx) => {
    try {
      const collection = await Collections.create({ ...payload, parents });

      if (collection && ctx.wh) {
        await svix.message.create(ctx.wh, {
          eventType: "collection.create",
          payload: {
            data: formatters.applyDataSpec(collection),
            type: "collection.create",
          },
        });
      }

      revalidatePath(`/collections`, "page");

      return { success: true, data: collection };
    } catch (error) {
      console.error(error);
      return { success: false, error: (error as Error).message };
    }
  },
});
