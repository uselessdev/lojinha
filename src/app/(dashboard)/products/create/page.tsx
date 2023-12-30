import { Collections } from "~/repositories/collections";
import { CreateProductForm } from "../components/create-product-form";

type Props = {
  params: {
    store: string;
  };
};

export default async function CreateProductPage({ params }: Props) {
  const collections = await Collections._all(params.store, { id: true, name: true });

  return <CreateProductForm collections={collections} />;
}
