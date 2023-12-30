import { auth } from "@clerk/nextjs";
import { ListKeys } from "./components/list-keys-table";
import { fetchApiKeys } from "./fetch-api-keys";

export default async function KeysPage() {
  const { orgId } = auth();

  const data = await fetchApiKeys(String(orgId));

  return <ListKeys keys={data.keys} />;
}
