import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { count, db, collections as c, and, eq, isNull } from "~/lib/db";
import { formatters } from "~/lib/formatters";

export const GET = async () => {
  const store = String(headers().get("X-Store-ID"));

  const results = await db.query.collections.findMany({
    where: (collection, { and, eq, isNull }) => and(eq(collection.store, store), isNull(collection.deletedAt)),
    with: {
      parents: {
        with: {
          parent: true,
        },
      },
      images: {
        columns: {
          url: true,
        },
      },
    },
  });

  const collections = results.map(({ parents, ...collection }) => ({
    ...collection,
    parents: parents.map((parents) => formatters.applyDataSpec(parents.parent)),
  }));

  const [{ total }] = await db
    .select({ total: count(c.id) })
    .from(c)
    .where(and(eq(c.store, store), isNull(c.deletedAt)));

  return NextResponse.json({ collections: formatters.applyDataSpec(collections), total });
};
