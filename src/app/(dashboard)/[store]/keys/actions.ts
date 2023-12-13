"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { env } from "~/env.mjs";
import { createServerAction } from "~/lib/actions/create-server-action";
import { unkey } from "~/lib/unkey";
import { Events } from "~/repositories/events";

export const createApiKeyAction = createServerAction({
  schema: z.object({
    public: z.boolean().default(true),
  }),
  handler: async (payload, ctx) => {
    try {
      const keys = await unkey.keys.create({
        name: ctx.store,
        prefix: payload.public ? "pk" : "sk",
        byteLength: 32,
        meta: {
          mode: payload.public ? "read" : "write",
        },
        apiId: env.UNKEY_APP_ID,
        ownerId: ctx.store,
      });

      await Events.create({ action: "CREATE_KEY", actor: ctx.user, store: ctx.store, payload: { store: ctx.store } });

      revalidatePath(`${ctx.store}/keys`, "page");

      return { success: true, data: keys.result };
    } catch (error) {
      console.error(error);
      return { success: false, error: (error as Error).message };
    }
  },
});

export const revokeApiKeyAction = createServerAction({
  schema: z.object({
    key: z.string().min(1),
  }),
  handler: async (payload, ctx) => {
    try {
      await unkey.keys.delete({ keyId: payload.key });
      await Events.create({ action: "REVOKE_KEY", actor: ctx.user, store: ctx.store, payload: { store: ctx.store } });

      revalidatePath(`${ctx.store}/keys`, "page");

      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },
});
