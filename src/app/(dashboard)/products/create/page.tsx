import { Collections } from "~/repositories/collections";
import { CreateProductForm } from "../components/create-product-form";

export default async function CreateProductPage() {
  const collections = await Collections._all({ id: true, name: true });

  return <CreateProductForm collections={collections} />;
}
