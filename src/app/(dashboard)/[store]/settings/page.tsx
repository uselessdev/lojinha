import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Stores } from "~/repositories/stores";
import { SettingsForm } from "./components/settings-form";

type Props = {
  params: {
    store: string;
  };
};

export default async function SettingsPage({ params }: Props) {
  const store = await Stores.find(params.store);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações</CardTitle>
      </CardHeader>

      <CardContent>
        <SettingsForm store={store} />
      </CardContent>
    </Card>
  );
}
