import { Products } from "~/repositories/products";
import { UpdateProductForm } from "../components/update-product-form";
import { notFound } from "next/navigation";
import { Collections } from "~/repositories/collections";

type Props = {
  params: {
    id: string;
    store: string;
  };
};

export default async function ProductPage({ params }: Props) {
  const product = await Products.find({ eid: params.id, store: params.store });
  const collections = await Collections._all(params.store, { id: true, name: true });

  if (!product) {
    return notFound();
  }

  return <UpdateProductForm product={product} collections={collections} />;
}
