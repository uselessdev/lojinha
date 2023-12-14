"use server";

import { UTApi } from "uploadthing/server";
import { z } from "zod";
import { env } from "~/env.mjs";
import { createServerAction } from "~/lib/actions/create-server-action";
import { Images } from "~/repositories/images";

const utapi = new UTApi({ apiKey: env.UPLOADTHING_SECRET });

export const deleteImagesAction = createServerAction({
  schema: z.object({
    key: z.string().min(1, "Image key is required"),
    id: z.number(),
  }),
  handler: async (payload, ctx) => {
    try {
      const result = await utapi.deleteFiles(payload.key);

      if (result.success) {
        await Images.remove(ctx.store, payload.id);
        return { success: true };
      }

      return { success: false, error: "Ocorreu um ero ao tentar excluir esta imagem." };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Ocorreu um ero ao tentar excluir esta imagem." };
    }
  },
});
