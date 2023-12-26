import { NextResponse } from "next/server";
import { db } from "~/lib/db";
import { formatters } from "~/lib/formatters";

type Params = {
  params: {
    slug: string;
  };
};

export async function GET(request: Request, { params }: Params) {
  const store = String(request.headers.get("X-Store-ID"));

  const result = await db.query.products.findFirst({
    where: (product, { and, eq, isNull }) =>
      and(eq(product.slug, params.slug), eq(product.store, store), isNull(product.deletedAt)),
    with: {
      collections: {
        with: {
          collection: true,
        },
      },
      images: true,
      options: true,
      variants: true,
    },
  });

  if (!result) {
    return NextResponse.json(
      { error: `Can't find any product with the slug ${params.slug}`, code: "NOT_FOUND" },
      { status: 404 },
    );
  }

  const product = {
    ...result,
    collections: result.collections.map(({ collection }) => formatters.applyDataSpec(collection)),
    images: result.images.map(({ cid, pid, ...image }) => formatters.applyDataSpec(image)),
    options: result.options.map(({ pid, ...option }) => formatters.applyDataSpec(option)),
    variants: result.variants.map(({ pid, ...variant }) => formatters.applyDataSpec(variant)),
  };

  return NextResponse.json({ product: formatters.applyDataSpec(product) });
}
