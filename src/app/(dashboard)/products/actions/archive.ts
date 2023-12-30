"use server";

import { createServerAction } from "~/lib/actions/create-server-action";
import { Products } from "~/repositories/products";
import { z } from "zod";
import { svix } from "~/lib/svix";
import { revalidatePath } from "next/cache";

export const archiveProductAction = createServerAction({
  schema: z.object({ id: z.number() }),
  handler: async (payload, ctx) => {
    try {
      const product = await Products.archive({ id: payload.id, store: ctx.store });

      if (product) {
        await svix.message.create(ctx.wh as string, {
          eventType: "product.archive",
          payload: {
            data: { id: payload.id },
            type: "product.archive",
          },
        });
      }

      revalidatePath(`/${ctx.store}/products`, "page");

      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, error: `Ocorreu um erro ao tentar arquivar o produto.` };
    }
  },
});
