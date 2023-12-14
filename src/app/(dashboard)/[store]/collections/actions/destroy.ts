"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerAction } from "~/lib/actions/create-server-action";
import { svix } from "~/lib/svix";
import { Collections } from "~/repositories/collections";

export const destroyCollectionAction = createServerAction({
  schema: z.object({ id: z.number() }),
  handler: async (payload, ctx) => {
    try {
      const collection = await Collections.destroy({ id: payload.id, store: ctx.store });

      if (collection) {
        if (collection) {
          await svix.message.create(String(ctx.wh), {
            eventType: "collection.delete",
            payload: { data: { id: collection.eid }, type: "collection.delete" },
          });
        }
      }

      revalidatePath(`/${ctx.store}/collections`, "page");

      return { success: true, data: collection };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Ocorreu um erro ao tentar excluir esta coleção, tente novamente." };
    }
  },
});
