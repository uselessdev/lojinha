"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerAction } from "~/lib/actions/create-server-action";
import { svix } from "~/lib/svix";
import { Collections } from "~/repositories/collections";

export const restoreCollectionAction = createServerAction({
  schema: z.object({ id: z.number() }),
  handler: async (payload, ctx) => {
    try {
      const collection = await Collections.restore({ id: payload.id });

      if (collection) {
        await svix.message.create(String(ctx.wh), {
          eventType: "collection.restore",
          payload: { data: { id: collection.eid }, type: "collection.restore" },
        });
      }

      revalidatePath(`/collections`, "page");

      return { success: true, data: collection };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },
});
