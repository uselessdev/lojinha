"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerAction } from "~/lib/actions/create-server-action";
import { svix } from "~/lib/svix";
import { Collections } from "~/repositories/collections";

export const archiveCollectionAction = createServerAction({
  schema: z.object({ id: z.number() }),
  handler: async (payload, ctx) => {
    try {
      const collection = await Collections.archive({ id: payload.id });

      if (collection) {
        await svix.message.create(String(ctx.wh), {
          eventType: "collection.archive",
          payload: { data: { id: collection.eid }, type: "collection.archive" },
        });
      }

      revalidatePath(`/collections`, "page");

      return { success: true, data: collection };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },
});
