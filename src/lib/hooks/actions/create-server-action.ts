import { auth } from "@clerk/nextjs";
import { z } from "zod";
import { Webhooks } from "~/repositories/webhooks";

export type Result<T> = { success: true; data?: T } | { success: false; error: string | string[] };

export function createServerAction<I, Output = void>(options: {
  schema: z.Schema<I>;
  handler: (args: I, ctx: { user: string; store: string; wh?: string | null }) => Promise<Output>;
}) {
  const { userId, orgId } = auth();

  return async (data: I) => {
    const payload = options.schema.safeParse(data);

    if (!payload.success) {
      return payload;
    }

    const wh = await Webhooks.find(String(orgId));

    return options.handler(payload.data, { store: String(orgId), user: String(userId), wh });
  };
}
