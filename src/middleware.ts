import { authMiddleware } from "@clerk/nextjs";
import { verifyKey } from "@unkey/api";
import { NextResponse } from "next/server";
import { env } from "./env.mjs";

export default authMiddleware({
  afterAuth: async (auth, request) => {
    if (request.method === "OPTIONS") {
      return NextResponse.next();
    }

    const host = request.headers.get("host");

    if (host?.startsWith("api.") || request.nextUrl.pathname.startsWith("/api/v1")) {
      const authorization = request.headers.get("authorization");

      if (!authorization) {
        return NextResponse.json("Unauthorized", { status: 401 });
      }

      if (!authorization.startsWith("Bearer ")) {
        return NextResponse.json("Unauthorized", { status: 401 });
      }

      const { result } = await verifyKey({ key: authorization.replace("Bearer ", ""), apiId: env.UNKEY_APP_ID });

      if (!result?.valid) {
        return NextResponse.json("Unauthorized", { status: 401 });
      }

      request.headers.set("X-Store-ID", String(result.ownerId));
      request.headers.set("X-Key-Meta", JSON.stringify(result.meta));

      return NextResponse.next();
    }
  },

  publicRoutes: [`/`, `/api/(.*)`, `/webhooks/(.*)`],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
