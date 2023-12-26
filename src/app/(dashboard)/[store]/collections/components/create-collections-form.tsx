"use client";

import slugify from "slugify";
import { SubmitButton } from "~/components/submit-button";
import { Collection } from "~/lib/db";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CollectionSchema, collectionSchema } from "../schema";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Editor } from "~/components/editor";
import { Autocomplete, Option } from "~/components/autocomplete";
import { InputUpload } from "~/components/input-upload";
import { useState } from "react";
import { useUploadThing } from "~/lib/uploadthing";
import { createCollectionAction } from "../actions/create";
import { useServerAction } from "~/lib/actions/use-server-action";
import { useToast } from "~/components/ui/use-toast";
import { useParams, useRouter } from "next/navigation";

type Props = {
  collections: Collection[];
};

export function CreateCollectionForm({ collections = [] }: Props) {
  const navigate = useRouter();
  const params = useParams();

  const { toast } = useToast();
  const { mutate } = useServerAction(createCollectionAction);

  const form = useForm<CollectionSchema>({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      parents: [],
    },
    resolver: zodResolver(collectionSchema),
  });

  const options: Option[] = collections.map((collection) => ({
    label: collection.name,
    value: collection.id,
  }));

  const [selectedFiles, setSelectedFiles] = useState<Array<File>>([]);
  const { startUpload, isUploading } = useUploadThing("collections");

  const onSubmit: SubmitHandler<CollectionSchema> = (data) => {
    mutate(data, {
      onSuccess: (data) => {
        if (data && selectedFiles.length > 0) {
          startUpload(selectedFiles, {
            collection: data.id,
          });
        }

        toast({
          title: "Coleção Criada",
          description: `A coleção ${data?.name} foi adicionada.`,
          className: "p-3",
        });

        navigate.push(`/${params.store}/collections`);
      },
      onError: () => {
        toast({
          title: "Ocorreu um erro",
          description: "Não foi possível criar esta coleção.",
        });
      },
    });
  };

  return (
    <Form {...form}>
      <form className="space-y-4" action={() => onSubmit(form.getValues())}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={({ target }) => {
                    form.setValue("name", target.value);
                    form.setValue("slug", slugify(target.value ?? "", { lower: true, trim: true }));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input {...field} readOnly />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          // @ts-expect-error cover is not in schema
          name="cover"
          render={() => (
            <FormItem>
              <FormLabel>Imagens</FormLabel>
              <FormControl>
                <InputUpload
                  multiple
                  files={selectedFiles}
                  onRemoveFile={(file) => {
                    const isString = typeof file === "string";

                    if (!isString) {
                      setSelectedFiles((files) => files.filter((f) => f.name !== file.name));
                    }
                  }}
                  onChange={(event) => setSelectedFiles((selected) => [...selected, ...event.target.files])}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parents"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Coleções</FormLabel>
                <FormControl>
                  <Autocomplete
                    options={options}
                    {...field}
                    onChange={({ target }) => {
                      form.setValue(
                        "parents",
                        target.value.map((e) => e.value as number),
                      );
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Coleções que esta coleção pertence. Por exemplo, você pode estar criando uma coleção Camisetas que
                  pertence a uma coleção Roupas.
                </FormDescription>
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <Editor label="Descrição" {...field} onChange={({ html }) => form.setValue("description", html)} />
          )}
        />

        <SubmitButton text="Criando coleção">Criar Coleção</SubmitButton>
      </form>
    </Form>
  );
}
