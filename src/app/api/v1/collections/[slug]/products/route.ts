import { headers } from "next/headers";
import { NextResponse } from "next/server";
import {
  db,
  eq,
  products as p,
  collections as c,
  productsToCollections as pc,
  count,
  and,
  isNull,
  inArray,
} from "~/lib/db";
import { formatters } from "~/lib/formatters";

type Props = {
  params: {
    slug: string;
  };
};

export const GET = async (request: Request, { params }: Props) => {
  const store = String(headers().get("X-Store-ID"));

  const results = await db.query.products.findMany({
    where: (product, { and, eq, inArray, isNull }) =>
      and(
        eq(product.store, store),
        eq(product.status, "ACTIVE"),
        isNull(product.deletedAt),
        inArray(
          product.id,
          db
            .select({ id: pc.product })
            .from(pc)
            .where(
              inArray(
                pc.collection,
                db
                  .select({ id: c.id })
                  .from(c)
                  .where(and(eq(c.slug, params.slug), eq(c.store, store), isNull(c.deletedAt))),
              ),
            ),
        ),
      ),
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
    .where(
      and(
        eq(p.store, store),
        eq(p.status, "ACTIVE"),
        isNull(p.deletedAt),
        inArray(
          p.id,
          db
            .select({ id: pc.product })
            .from(pc)
            .where(
              inArray(
                pc.collection,
                db
                  .select({ id: c.id })
                  .from(c)
                  .where(and(eq(c.slug, params.slug), eq(c.store, store), isNull(c.deletedAt))),
              ),
            ),
        ),
      ),
    );

  return NextResponse.json({ products: formatters.applyDataSpec(products), total });
};
