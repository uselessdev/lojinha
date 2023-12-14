import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Collections } from "~/repositories/collections";
import { CreateCollectionForm } from "../components/create-collections-form";

type Props = {
  params: {
    store: string;
  };
};

export default async function CreateCollectionPage({ params }: Props) {
  const collections = await Collections._all(params.store, { id: true, name: true });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Coleção</CardTitle>
        <CardDescription>Uma coleção pode ser, um grupo de coleções, promoções, categorias, etc.</CardDescription>
      </CardHeader>

      <CardContent>
        <CreateCollectionForm collections={collections} />
      </CardContent>
    </Card>
  );
}
