import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Collections } from "~/repositories/collections";
import { CollectionsList } from "./components/list-collections-table";

type Props = {
  params: {
    store: string;
  };
};

export default async function CollectionsPage({ params }: Props) {
  const collections = await Collections.all(params.store);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Coleções</CardTitle>

        <Button size="sm" asChild>
          <Link href={`collections/create`}>Adicionar Coleção</Link>
        </Button>
      </CardHeader>

      {collections.length <= 0 ? (
        <CardContent className="py-4">
          <CardDescription className="text-center text-xs">
            Você ainda não tem nenhuma coleção cadastrada.
          </CardDescription>
        </CardContent>
      ) : null}

      {collections.length > 0 ? <CollectionsList collections={collections} /> : null}
    </Card>
  );
}
