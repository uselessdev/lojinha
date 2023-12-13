import { ListKeys } from "./components/list-keys-table";
import { fetchApiKeys } from "./fetch-api-keys";

type Props = {
  params: {
    store: string;
  };
};

export default async function KeysPage({ params }: Props) {
  const data = await fetchApiKeys(params.store);

  return <ListKeys keys={data.keys} />;
}
