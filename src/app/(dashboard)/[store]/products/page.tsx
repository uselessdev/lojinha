import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Products } from "~/repositories/products";
import { ProductsList } from "./components/list-product-form";

type Props = {
  params: {
    store: string;
  };
};

export default async function ProductsPage({ params }: Props) {
  const products = await Products.all(params.store);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Produtos</CardTitle>

        <Button size="sm" asChild>
          <Link href={`products/create`}>Adicionar Produto</Link>
        </Button>
      </CardHeader>

      {products.length <= 0 ? (
        <CardContent className="py-4">
          <CardDescription className="text-center text-xs">
            Você ainda não tem nenhum produto cadastrado.
          </CardDescription>
        </CardContent>
      ) : null}

      {products.length > 0 ? <ProductsList products={products} /> : null}
    </Card>
  );
}
