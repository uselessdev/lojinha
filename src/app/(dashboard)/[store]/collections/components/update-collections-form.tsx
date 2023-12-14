"use client";

import { useForm } from "react-hook-form";
import slugify from "slugify";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Autocomplete, Option } from "~/components/autocomplete";
import { Editor } from "~/components/editor";
import { InputUpload } from "~/components/input-upload";
import { useState } from "react";
import { useUploadThing } from "~/lib/uploadthing";
import { type CollectionSchema, collectionSchema } from "../schema";
import { useParams, useRouter } from "next/navigation";
import { toast } from "~/components/ui/use-toast";
import { Collection, Image } from "~/lib/db";
import { SubmitButton } from "~/components/submit-button";
import { useServerAction } from "~/lib/actions/use-server-action";
import { deleteImagesAction } from "../actions/images";
import { updateCollectionAction } from "../actions/update";

type Props = {
  collection: Collection & { parents: Collection[]; images: Image[] };
  collections: Collection[];
};

export function UpdateCollectionForm({ collections, collection }: Props) {
  const images = useServerAction(deleteImagesAction);
  const update = useServerAction(updateCollectionAction);

  const router = useRouter();
  const params = useParams();

  const form = useForm<CollectionSchema>({
    mode: "all",
    defaultValues: {
      name: collection.name,
      slug: collection.slug,
      description: collection.description ?? "",
    },
    resolver: zodResolver(collectionSchema),
  });

  const [selectedFiles, setSelectedFiles] = useState<Array<File>>([]);
  const { startUpload, isUploading } = useUploadThing("collections");

  const options: Option[] = collections.map((collection) => ({
    value: collection.id,
    label: collection.name,
  }));

  const selected: Option[] = collection.parents.map((collection) => ({
    value: collection.id,
    label: collection.name,
  }));

  const onSubmit = () => {
    update.mutate(
      { ...form.getValues(), id: collection.id },
      {
        async onSuccess(data) {
          if (selectedFiles.length > 0 && data) {
            await startUpload(selectedFiles, { collection: data.id });
          }

          toast({
            title: "Coleção Alterada",
            description: `A coleção ${data?.name} foi alterada.`,
            className: "p-3",
          });

          router.push(`/${params.store}/collections`);
        },
        onError: () => {
          toast({
            title: "Erro",
            description: "Ocorreu um erro ao tentar alterar sua coleção, tente novamente.",
            className: "p-3",
            variant: "destructive",
          });
        },
      },
    );
  };

  return (
    <Form {...form}>
      <form className="space-y-4" action={onSubmit}>
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
                    form.setValue("slug", slugify(target.value, { lower: true, trim: true }));
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
              <FormDescription>Este campo é preenchido de forma automática.</FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          // @ts-expect-error name is not from schema
          name="cover"
          render={() => (
            <FormItem>
              <FormLabel>Imagem</FormLabel>
              <FormControl>
                <InputUpload
                  files={[...collection.images.map((image) => image.url), ...selectedFiles]}
                  onRemoveFile={(file) => {
                    const isString = typeof file === "string";

                    if (isString) {
                      const image = collection.images.find((i) => file === i.url);

                      if (image) {
                        images.mutate({ id: image.id, key: image.key }, { onSuccess: () => router.refresh() });
                      }
                    }

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
          render={() => {
            return (
              <FormItem>
                <FormLabel>Coleções</FormLabel>
                <FormControl>
                  <Autocomplete
                    options={options}
                    defaultSelected={selected}
                    onChange={({ target }) => {
                      form.setValue(
                        "parents",
                        target.value.map(({ value }) => value as number),
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
            <Editor
              label="Descrição"
              initialValue={field.value}
              onChange={({ html }) => form.setValue("description", html)}
            />
          )}
        />

        <SubmitButton text="Alterando...">Alterar Coleção</SubmitButton>
      </form>
    </Form>
  );
}
