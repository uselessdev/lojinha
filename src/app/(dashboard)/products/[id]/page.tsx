import { Products } from "~/repositories/products";
import { UpdateProductForm } from "../components/update-product-form";
import { notFound } from "next/navigation";
import { Collections } from "~/repositories/collections";

type Props = {
  params: {
    id: string;
  };
};

export default async function ProductPage({ params }: Props) {
  const product = await Products.find({ eid: params.id });
  const collections = await Collections._all({ id: true, name: true });

  if (!product) {
    return notFound();
  }

  return <UpdateProductForm product={product} collections={collections} />;
}
