"use server";

import { createServerAction } from "~/lib/actions/create-server-action";
import { settingsSchema } from "./schema";
import { Stores } from "~/repositories/stores";

export const updateStoreAction = createServerAction({
  schema: settingsSchema,
  handler: async (payload, ctx) => {
    try {
      await Stores.update(payload, ctx);

      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, error: `Alguma coisa deu errado ao tentar alterar suas configurações.` };
    }
  },
});
