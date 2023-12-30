"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";
import { SubmitHandler, useFieldArray, useForm, useWatch } from "react-hook-form";
import slugify from "slugify";
import { Autocomplete, Option } from "~/components/autocomplete";
import { Editor } from "~/components/editor";
import { InputUpload } from "~/components/input-upload";
import { SubmitButton } from "~/components/submit-button";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { ProductSchema, productSchema } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Collection } from "~/lib/db";
import { useEffect, useState } from "react";
import { formatters } from "~/lib/formatters";
import { Variants } from "./variants";
import { cartesian } from "../utils";
import { useServerAction } from "~/lib/actions/use-server-action";
import { createProductAction } from "../actions/create";
import { useUploadThing } from "~/lib/uploadthing";
import { useToast } from "~/components/ui/use-toast";
import { useRouter } from "next/navigation";

type Props = {
  collections: Pick<Collection, "id" | "name">[];
};

export function CreateProductForm({ collections }: Props) {
  const navigate = useRouter();
  const { toast } = useToast();
  const { mutate } = useServerAction(createProductAction);

  const form = useForm<ProductSchema>({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      price: "R$ 0,00",
      originalPrice: "R$ 0,00",
      quantity: 1,
      sku: "",
      status: "DRAFT",
      collections: [],
    },
    resolver: zodResolver(productSchema),
  });

  const [selectedFiles, setSelectedFiles] = useState<Array<File>>([]);

  const options: Option[] = collections.map((collection) => ({
    label: collection.name,
    value: collection.id,
  }));

  const variants = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const watched = useWatch({
    control: form.control,
    name: "variants",
    defaultValue: [],
  });

  useEffect(() => {
    const options = cartesian(...watched.map(({ values }) => values)).map((option) =>
      option.map((value) => value.trim()).join(`/`),
    );

    if (options.every(Boolean)) {
      form.setValue(
        `options`,
        options.map((option) => ({
          name: option,
          price: "0",
          originalPrice: "0",
          quantity: 1,
          sku: "",
        })),
      );
    }
  }, [watched, form]);

  const { startUpload } = useUploadThing("products");

  const onSubmit: SubmitHandler<ProductSchema> = (data) => {
    mutate(data, {
      async onSuccess(data) {
        if (data && selectedFiles.length > 0) {
          startUpload(selectedFiles, { product: data.id });
        }

        toast({
          title: "Produto Criado",
          description: `O produto ${data?.name} foi adicionado.`,
          className: "p-3",
        });

        navigate.push(`/products`);
      },

      onError() {
        toast({
          title: "Ocorreu um erro",
          description: "Não foi possível criar este produto.",
          variant: "destructive",
          className: "p-3",
        });
      },
    });
  };

  return (
    <Form {...form}>
      <form className="space-y-6" action={() => onSubmit(form.getValues())}>
        <Card>
          <CardHeader>
            <CardTitle>Novo Produto</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
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
                        form.setValue(
                          "slug",
                          slugify(String(target.value), {
                            lower: true,
                            trim: true,
                          }),
                        );
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Editor label="Descrição" {...field} onChange={({ html }) => form.setValue("description", html)} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-medium">Organização e Visibilidade</h3>
          </CardHeader>

          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="collections"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coleções</FormLabel>
                  <FormControl>
                    <Autocomplete
                      options={options}
                      {...field}
                      onChange={({ target }) => {
                        form.setValue(
                          "collections",
                          target.value.map(({ value }) => value as number),
                        );
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um status para este produto" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      <SelectItem value="ACTIVE">Ativo</SelectItem>
                      <SelectItem value="DRAFT">Rascunho</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-medium">Imagens</h3>
          </CardHeader>

          <CardContent>
            <FormField
              control={form.control}
              // @ts-expect-error cover was not in schema
              name="cover"
              render={() => (
                <FormItem>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-medium">Preço e Estoque</h3>
          </CardHeader>

          <CardContent className="flex w-full gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Preço</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={({ target }) => {
                        form.setValue("price", formatters.currency(formatters.number(target.value)));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="originalPrice"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Preço Original</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={({ target }) => {
                        form.setValue("originalPrice", formatters.currency(formatters.number(target.value)));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Quantidade</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={({ target }) => form.setValue("quantity", formatters.number(target.value))}
                      type="number"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-medium">Variantes</h3>
          </CardHeader>

          {variants.fields.length > 0 ? (
            <div>
              {variants.fields.map((variant, index) => (
                <CardContent key={variant.id} className="space-y-6 border-b py-6 first:pt-0 last:border-b-0">
                  <FormField
                    name={`variants.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex gap-2 space-y-0">
                        <FormControl>
                          <Input {...field} placeholder="Nome" />
                        </FormControl>
                        <Button size="icon" variant="ghost" type="button" onClick={() => variants.remove(index)}>
                          <Trash2Icon />
                          <span className="sr-only">Remover Variação</span>
                        </Button>
                      </FormItem>
                    )}
                  />

                  <Variants index={index} />
                </CardContent>
              ))}
            </div>
          ) : null}

          <CardFooter className="border-t py-0">
            <Button
              type="button"
              variant="link"
              className="gap-2 px-0 hover:text-zinc-500 hover:no-underline"
              onClick={() => variants.append({ name: "", values: [" "] })}
            >
              <PlusIcon /> Adicionar Variante
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-medium">Opções</h3>
          </CardHeader>

          {watched.length > 0 ? (
            <CardContent className="space-y-3">
              {cartesian(...watched.map(({ values }) => values)).map((option, index) => (
                <div key={option.join("-")} className="flex gap-2">
                  <FormField
                    name={`options.${index}.name`}
                    render={({ field }) => {
                      return (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input {...field} placeholder="Nome" defaultValue={option.join(`/`)} />
                          </FormControl>
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    name={`options.${index}.price`}
                    render={({ field }) => {
                      return (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Preço"
                              onChange={({ target }) => {
                                form.setValue(
                                  `options.${index}.price`,
                                  formatters.currency(formatters.number(target.value)),
                                );
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    name={`options.${index}.originalPrice`}
                    render={({ field }) => {
                      return (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Preço Original"
                              onChange={({ target }) => {
                                form.setValue(
                                  `options.${index}.originalPrice`,
                                  formatters.currency(formatters.number(target.value)),
                                );
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    name={`options.${index}.quantity`}
                    render={({ field }) => {
                      return (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Quantidade"
                              onChange={({ target }) =>
                                form.setValue(`options.${index}.quantity`, formatters.number(target.value))
                              }
                              type="number"
                            />
                          </FormControl>
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    name={`options.${index}.sku`}
                    render={({ field }) => {
                      return (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input {...field} placeholder="SKU" />
                          </FormControl>
                        </FormItem>
                      );
                    }}
                  />
                </div>
              ))}
            </CardContent>
          ) : (
            <CardContent>
              <p className="text-sm text-foreground">Produto sem nenhuma variação.</p>
            </CardContent>
          )}
        </Card>

        <SubmitButton text="Criando..." className="bottom-4 w-full">
          Criar Produto
        </SubmitButton>
      </form>
    </Form>
  );
}
