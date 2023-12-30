"use server";

import { createServerAction } from "~/lib/actions/create-server-action";
import { productSchema } from "../schema";
import { revalidatePath } from "next/cache";
import { Products } from "~/repositories/products";
import { svix } from "~/lib/svix";
import { formatters } from "~/lib/formatters";

export const createProductAction = createServerAction({
  schema: productSchema,
  handler: async (payload, ctx) => {
    try {
      const product = await Products.create(payload);

      if (product) {
        await svix.message.create(ctx.wh as string, {
          eventType: "product.create",
          payload: { data: formatters.applyDataSpec(product), type: "product.create" },
        });
      }

      revalidatePath(`/products`, "page");

      return { success: true, data: product };
    } catch (error) {
      console.log(error);
      return { success: false, error: "Ocorreu um erro ao tentar criar o produto" };
    }
  },
});
