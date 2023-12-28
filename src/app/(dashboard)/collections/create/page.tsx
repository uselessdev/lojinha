import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Collections } from "~/repositories/collections";
import { CreateCollectionForm } from "../components/create-collections-form";

export default async function CreateCollectionPage() {
  const collections = await Collections._all({ id: true, name: true });

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
