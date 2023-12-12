import { auth } from "@clerk/nextjs";
import { db } from "~/lib/db";

export const Events = {
  all: async () => {
    const { userId, orgId } = auth();

    return await db.query.events.findMany({
      where: (event, { or, eq }) => or(eq(event.actor, String(userId)), eq(event.store, String(orgId))),
      orderBy: (event, { desc }) => desc(event.createdAt),
    });
  },
};
