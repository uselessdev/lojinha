import { Svix } from "svix";
import { env } from "~/env.mjs";

export const svix = new Svix(env.SVIX_AUTH_TOKEN);
