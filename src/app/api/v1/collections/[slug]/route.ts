import { NextResponse } from "next/server";
import { db } from "~/lib/db";
import { formatters } from "~/lib/formatters";

type Props = {
  params: {
    slug: string;
  };
};

export const GET = async (request: Request, { params }: Props) => {
  const store = String(request.headers.get("X-Store-ID"));

  const results = await db.query.collections.findFirst({
    where: (collection, { eq, and, isNull }) =>
      and(eq(collection.slug, params.slug), eq(collection.store, store), isNull(collection.deletedAt)),
    with: {
      parents: {
        with: {
          parent: true,
        },
      },
      images: true,
    },
  });

  if (!results) {
    return NextResponse.json({ code: "NOT_FOUND", success: false }, { status: 404 });
  }

  const collection = {
    ...results,
    parents: (results?.parents ?? []).map(({ parent }) => formatters.applyDataSpec(parent)),
    images: formatters.applyDataSpec(results.images),
  };

  return NextResponse.json({ collection: formatters.applyDataSpec(collection) });
};
