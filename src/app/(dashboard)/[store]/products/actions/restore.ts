"use server";

import { createServerAction } from "~/lib/actions/create-server-action";
import { Products } from "~/repositories/products";
import { z } from "zod";
import { svix } from "~/lib/svix";
import { revalidatePath } from "next/cache";

export const restoreProductAction = createServerAction({
  schema: z.object({ id: z.number() }),
  handler: async (payload, ctx) => {
    try {
      const product = await Products.restore({ id: payload.id, store: ctx.store });

      if (product) {
        await svix.message.create(ctx.wh as string, {
          eventType: "product.restore",
          payload: {
            data: { id: payload.id },
            type: "product.restore",
          },
        });
      }

      revalidatePath(`/${ctx.store}/products`, "page");

      return { success: true };
    } catch (error) {
      return { success: false, error: `Ocorreu um erro ao tentar criar seu produto.` };
    }
  },
});
