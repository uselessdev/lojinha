"use server";

import { createServerAction } from "~/lib/actions/create-server-action";
import { updateProductSchema } from "../schema";
import { Products } from "~/repositories/products";
import { svix } from "~/lib/svix";
import { formatters } from "~/lib/formatters";
import { revalidatePath } from "next/cache";

export const updateProductAction = createServerAction({
  schema: updateProductSchema,
  handler: async (payload, ctx) => {
    try {
      const product = await Products.update({ product: payload, store: ctx.store });

      if (product) {
        await svix.message.create(ctx.wh as string, {
          eventType: "product.update",
          payload: {
            data: formatters.applyDataSpec(product),
            type: "product.update",
          },
        });
      }

      revalidatePath(`/${ctx.store}/products`, "page");

      return { success: true, data: product };
    } catch (error) {
      console.error(error);
      return { success: false, error: `Ocorreu um erro ao tentar atualizar o produto.` };
    }
  },
});
