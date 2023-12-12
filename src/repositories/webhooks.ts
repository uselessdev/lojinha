import { WebhookPayload, db, webhooks } from "~/lib/db";

export const Webhooks = {
  find: async (store: string) => {
    const result = await db.query.webhooks.findFirst({
      where: (wh, { eq }) => eq(wh.store, store),
      columns: {
        sid: true,
      },
    });

    return result?.sid;
  },

  create: async (payload: WebhookPayload) => {
    return db.insert(webhooks).values(payload);
  },
};
