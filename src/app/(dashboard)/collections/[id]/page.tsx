import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Collections } from "~/repositories/collections";
import { UpdateCollectionForm } from "../components/update-collections-form";
import { db } from "~/lib/db";

type Props = {
  params: {
    id: string;
  };
};

export default async function CollectionPage({ params }: Props) {
  const collection = await Collections.find(params.id);

  if (!collection) {
    return notFound();
  }

  const collections = await Collections._all({ id: true, name: true }, [collection.id as number]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coleção</CardTitle>
      </CardHeader>

      <CardContent>
        <UpdateCollectionForm collection={collection} collections={collections} />
      </CardContent>
    </Card>
  );
}
