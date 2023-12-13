"use server";

import { revalidatePath } from "next/cache";
import { settingsSchema } from "./schema";
import { Stores } from "~/repositories/stores";
import { createServerAction } from "~/lib/actions/create-server-action";

export const updateStoreAction = createServerAction({
  schema: settingsSchema,
  handler: async (payload, ctx) => {
    try {
      await Stores.update(payload, ctx);

      revalidatePath(`/${ctx.store}/settings`, "page");

      return { success: true, data: { id: "name" } };
    } catch (error) {
      return { success: false, error: `Alguma coisa deu errado ao tentar alterar suas configurações.` };
    }
  },
});
