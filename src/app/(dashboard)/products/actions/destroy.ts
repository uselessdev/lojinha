"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerAction } from "~/lib/actions/create-server-action";
import { svix } from "~/lib/svix";
import { Products } from "~/repositories/products";

export const destroyProductAction = createServerAction({
  schema: z.object({ id: z.number() }),
  handler: async (payload, ctx) => {
    try {
      const product = await Products.destroy(payload);

      if (product) {
        await svix.message.create(ctx.wh as string, {
          eventType: "product.delete",
          payload: {
            data: { id: product.id },
            type: "product.delete",
          },
        });
      }

      revalidatePath(`/${ctx.store}/products`, "page");

      return { success: true, data: product };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Ocorreu um erro ao tentar apagar este produto." };
    }
  },
});
