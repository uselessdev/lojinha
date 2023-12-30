import { notFound } from "next/navigation";
import { env } from "~/env.mjs";
import { Portal } from "./components/portal";
import { Webhooks } from "~/repositories/webhooks";
import { auth } from "@clerk/nextjs";

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

export default async function WebhooksPage() {
  const { orgId } = auth();
  const portal = await Webhooks.find(String(orgId));

  if (!portal) {
    return notFound();
  }

  const { url } = await getSvixPortal(portal);

  return <Portal url={url} />;
}
