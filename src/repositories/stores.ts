import { and, db, emails as e, eq, notInArray, stores } from "~/lib/db";
import { z } from "zod";
import { settingsSchema } from "~/app/(dashboard)/[store]/settings/schema";
import { Events } from "./events";

export const Stores = {
  find: async (id: string) => {
    return db.query.stores.findFirst({
      where: ({ store }, { eq }) => eq(store, id),
      with: {
        emails: true,
      },
    });
  },

  update: async ({ emails = [], ...payload }: z.input<typeof settingsSchema>, ctx: { store: string; user: string }) => {
    await db.transaction(async (tx) => {
      const [store] = await tx
        .insert(stores)
        .values({ ...payload, store: ctx.store })
        .onConflictDoUpdate({ set: { ...payload, updatedAt: new Date() }, target: stores.store })
        .returning();

      if (emails.length <= 0) {
        await tx.delete(e).where(eq(e.store, ctx.store));
      }

      if (store && emails?.length > 0) {
        await tx.delete(e).where(and(notInArray(e.address, emails), eq(e.store, ctx.store)));

        await tx
          .insert(e)
          .values(emails.map((address) => ({ address, store: ctx.store, storeId: store.id })))
          .onConflictDoNothing();
      }

      await Events.create({
        action: "UPDATE_STORE",
        actor: ctx.user,
        store: ctx.store,
        payload: { ...payload, emails },
      });
    });
  },
};
