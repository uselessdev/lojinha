import { auth } from "@clerk/nextjs";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { z } from "zod";
import { Images } from "~/repositories/images";

const f = createUploadthing();

export const fileRouter = {
  collections: f({ image: { maxFileSize: "2MB", maxFileCount: 10 } })
    .input(z.object({ collection: z.number() }))
    .middleware(({ input }) => {
      const { orgId } = auth();

      console.log(`starting upload for store: ${orgId}`);

      return { collection: input.collection, store: String(orgId) };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      console.log(`upload completed for file: ${file.key}`);

      await Images.create({
        collection: metadata.collection,
        store: metadata.store,
        key: file.key,
        url: file.url,
      });

      console.log(`connected image: ${file.key} to colelction: ${metadata.collection}`);
    }),
} satisfies FileRouter;

export type FileRouterLojinha = typeof fileRouter;
