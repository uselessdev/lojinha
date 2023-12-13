import { Unkey } from "@unkey/api";
import { env } from "~/env.mjs";

export const unkey = new Unkey({ token: env.UNKEY_APP_KEY });
