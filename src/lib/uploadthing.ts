import { generateComponents } from "@uploadthing/react";
import { generateReactHelpers } from "@uploadthing/react/hooks";
import type { FileRouterLojinha } from "~/app/api/uploadthing/core";

export const { uploadFiles, useUploadThing } = generateReactHelpers<FileRouterLojinha>();
export const { UploadDropzone } = generateComponents<FileRouterLojinha>();
