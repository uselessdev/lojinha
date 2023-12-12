import type { OrganizationJSON, UserJSON, WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { Webhook, type WebhookRequiredHeaders } from "svix";
import { env } from "~/env.mjs";
import { svix } from "~/lib/svix";
import { Events } from "~/repositories/events";
import { Webhooks } from "~/repositories/webhooks";

async function handler(request: Request) {
  const payload = (await request.json()) as string;

  const requiredHeader = {
    "svix-id": headers().get("svix-id"),
    "svix-timestamp": headers().get("svix-timestamp"),
    "svix-signature": headers().get("svix-signature"),
  };

  const wh = new Webhook(env.SVIX_WEBHOOK_CLERK_SECRET);

  let data: WebhookEvent;

  try {
    data = wh.verify(JSON.stringify(payload), requiredHeader as WebhookRequiredHeaders) as WebhookEvent;
  } catch (error) {
    console.error(`create account webhook error: `, error);
    return new Response(null, { status: 400 });
  }

  switch (data.type) {
    case "user.created":
      await createAccountEvent(data.data);
      break;
    case "organization.created":
      await createStoreEvent(data.data);
      break;
    default:
      break;
  }

  return new Response("OK", { status: 201 });
}

export const POST = handler;

async function createAccountEvent(user: UserJSON) {
  const payload = {
    id: user.id,
    email: user.email_addresses.map(({ email_address }) => email_address),
    name: `${user.first_name} ${user.last_name}`,
  };

  await Events.create({ action: "CREATE_ACCOUNT", actor: user.id, payload });
}

async function createStoreEvent(store: OrganizationJSON) {
  const payload = {
    id: store.id,
    name: store.name,
    created_by: store.created_by,
  };

  const app = await svix.application.create({ name: payload.name });

  await Webhooks.create({ store: store.id, sid: app.id });
  await Events.create({ action: "CREATE_STORE", actor: store.created_by, store: store.id, payload });
}
