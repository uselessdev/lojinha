"use client";

import clsx from "clsx";
import { useCallback } from "react";
import { Button } from "./ui/button";
import { Trash2Icon } from "lucide-react";
import { useDropzone } from "@uploadthing/react/hooks";

type Props = {
  name?: string;
  multiple?: boolean;
  files?: (File | string)[];
  onRemoveFile?: (file: File | string) => void;
  onChange: (event: { target: { name: string; files: File[]; value: File[] } }) => void;
};

export function InputUpload({ multiple, name = "upload", files = [], onChange, onRemoveFile }: Props) {
  const onDrop = useCallback((files: File[]) => {
    files.forEach((file: File) => {
      const values = [file];

      onChange({
        target: {
          name,
          files: values,
          value: values,
        },
      });
    });
    // eslint-disable-next-line
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple,
    accept: {
      "image/jpg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/avif": [".avif"],
    },
    maxSize: 2 / 1e-6, // <- maxSize to 2mb,
    onDrop,
  });

  return (
    <section
      className={clsx("w-full rounded-md border border-input bg-background p-2", {
        "ring-2 ring-gray-700 ring-offset-2": isDragActive,
      })}
    >
      <div {...getRootProps({ className: "dropzone min-h-[160px]" })}>
        <input {...getInputProps()} />

        {files.length <= 0 ? (
          <div className="grid min-h-[160px] place-content-center">
            <p className="h-full w-full text-center text-sm">Selecione ou arraste seus arquivos aqui.</p>
          </div>
        ) : null}

        {files.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2">
            {files.map((file: File | string) => {
              const isString = typeof file === "string";

              return (
                <picture key={isString ? file : file.name} className="group relative">
                  {/* eslint-disable-next-line */}
                  <img
                    src={isString ? file : URL.createObjectURL(file)}
                    className="h-40 w-full rounded-sm object-cover object-center"
                  />

                  <Button
                    size="icon"
                    className="absolute bottom-2 right-2 h-6 w-6 bg-red-400/40"
                    variant="destructive"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();

                      if (onRemoveFile) {
                        onRemoveFile(file);
                      }
                    }}
                  >
                    <Trash2Icon className="h-3 w-3" />
                  </Button>
                </picture>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
