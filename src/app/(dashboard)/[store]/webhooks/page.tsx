import { notFound } from "next/navigation";
import { env } from "~/env.mjs";
import { Webhooks } from "~/repositories/webhooks";
import { Portal } from "./components/portal";

type Props = {
  params: {
    store: string;
  };
};

async function getSvixPortal(id: string) {
  const result = await fetch(`${env.SVIX_PORTAL_URL}/${id}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accep: "application/json",
      Authorization: `Bearer ${env.SVIX_AUTH_TOKEN}`,
    },
    body: JSON.stringify({}),
  });

  return result.json() as Promise<{ url: string }>;
}

export default async function WebhooksPage({ params }: Props) {
  const portal = await Webhooks.find(params.store);

  if (!portal) {
    return notFound();
  }

  const { url } = await getSvixPortal(portal);

  return <Portal url={url} />;
}
