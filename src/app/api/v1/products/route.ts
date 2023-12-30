import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { count, db, and, eq, isNull, products as p } from "~/lib/db";
import { formatters } from "~/lib/formatters";

export const GET = async () => {
  const store = String(headers().get("X-Store-ID"));

  const results = await db.query.products.findMany({
    where: (product, { and, eq, isNull, ne }) =>
      and(eq(product.store, store), eq(product.status, "ACTIVE"), isNull(product.deletedAt)),
    with: {
      collections: {
        with: {
          collection: true,
        },
      },
      images: {
        columns: {
          url: true,
        },
      },
      options: true,
      variants: true,
    },
  });

  const products = results.map((product) => ({
    ...product,
    collections: formatters.applyDataSpec(product.collections.map(({ collection }) => collection)),
    options: product.options.map(({ pid, ...option }) => formatters.applyDataSpec(option)),
    variants: product.variants.map(({ pid, ...variant }) => formatters.applyDataSpec(variant)),
  }));

  const [{ total }] = await db
    .select({ total: count(p.id) })
    .from(p)
    .where(and(eq(p.store, store), eq(p.status, "ACTIVE"), isNull(p.deletedAt)));

  return NextResponse.json({ products: formatters.applyDataSpec(products), total });
};
