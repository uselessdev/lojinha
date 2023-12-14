import { auth } from "@clerk/nextjs";
import { InsertEvent, db, events } from "~/lib/db";

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export const Events = {
  all: async () => {
    const { userId, orgId } = auth();

    return await db.query.events.findMany({
      where: (event, { or, eq }) => or(eq(event.actor, String(userId)), eq(event.store, String(orgId))),
      orderBy: (event, { desc }) => desc(event.createdAt),
    });
  },

  create: async (event: PartialBy<InsertEvent, "actor" | "store">) => {
    const { userId, orgId } = auth();

    return await db
      .insert(events)
      .values({ ...event, actor: event.actor || String(userId), store: event.store || orgId });
  },
};
