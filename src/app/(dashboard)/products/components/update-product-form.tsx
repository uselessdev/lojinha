"use client";

import { SubmitHandler, useFieldArray, useForm, useWatch } from "react-hook-form";
import slugify from "slugify";
import { Editor } from "~/components/editor";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Collection, Image, Option, Product, Variant } from "~/lib/db";
import { ProductSchema, productSchema } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Autocomplete } from "~/components/autocomplete";
import { InputUpload } from "~/components/input-upload";
import { useEffect, useState } from "react";
import { useServerAction } from "~/lib/actions/use-server-action";
import { deleteImagesAction } from "../../collections/actions/images";
import { useRouter } from "next/navigation";
import { formatters } from "~/lib/formatters";
import { Button } from "~/components/ui/button";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { Variants } from "./variants";
import { cartesian } from "../utils";
import { SubmitButton } from "~/components/submit-button";
import { useUploadThing } from "~/lib/uploadthing";
import { updateProductAction } from "../actions/update";
import { useToast } from "~/components/ui/use-toast";

type Props = {
  collections: Pick<Collection, "id" | "name">[];
  product: Product & { collections: Collection[]; variants: Variant[]; options: Option[]; images: Image[] };
};

export function UpdateProductForm({ product, collections }: Props) {
  const navigation = useRouter();
  const { toast } = useToast();
  const update = useServerAction(updateProductAction);

  const defaultOption = product.options
    .map((option) => ({
      ...option,
      price: formatters.currency(option.price ?? 0),
      originalPrice: formatters.currency(option.originalPrice ?? 0),
      quantity: option.quantity ?? 0,
      sku: option.sku ?? "",
    }))
    .find(({ name }) => name === "default");

  const defaultVariant = product.variants.find(({ name }) => name === "default");
  const customVariants = product.variants.filter(({ name }) => name !== "default");
  const customOptions = product.options.filter(({ name }) => name !== "default");

  const form = useForm<ProductSchema>({
    defaultValues: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: String(product.description),
      collections: product.collections.map(({ id }) => id),
      status: product.status ?? "DRAFT",
      price: defaultOption?.price,
      originalPrice: defaultOption?.originalPrice,
      quantity: defaultOption?.quantity,
      sku: defaultOption?.sku,
      // @TODO remove this
      // @ts-expect-error
      variants: customVariants,
      options: customOptions.map((option) => ({
        ...option,
        price: formatters.currency(option.price ?? 0),
        originalPrice: formatters.currency(option.originalPrice ?? 0),
        quantity: option.quantity ?? 0,
        sku: option.sku ?? "",
      })),
    },
    resolver: zodResolver(productSchema),
  });

  const router = useRouter();
  const images = useServerAction(deleteImagesAction);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const options = collections.map((collection) => ({
    value: collection.id,
    label: collection.name,
  }));

  const selectedCollections = product.collections.map((collection) => ({
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
    // @TODO remove this
    // @ts-expect-error
    defaultValue: product.variants.filter(({ name }) => name !== "default"),
  });

  useEffect(() => {
    const options = cartesian(...watched.map(({ values }) => values as string[])).map((option) => {
      return option.every((value) => Boolean(value.trim())) ? option.map((value) => value.trim()).join(`/`) : null;
    }) as string[];

    form.setValue(
      `options`,
      options.filter(Boolean).map((option) => {
        const result = product.options.find(({ name }) => option === name);

        return {
          id: result?.id ?? undefined,
          name: option,
          originalPrice: result?.originalPrice ? formatters.currency(result.originalPrice) : "",
          price: result?.price ? formatters.currency(result.price) : "",
          quantity: result?.quantity ?? 0,
          sku: result?.sku ?? "",
        };
      }),
    );
  }, [watched, form, product.options]);

  const { startUpload } = useUploadThing("products");

  const onSubmit: SubmitHandler<ProductSchema> = (data) => {
    update.mutate(
      {
        ...data,
        id: product.id,
        // @TODO remove this
        // @ts-expect-error
        variants: defaultVariant ? [defaultVariant, ...data.variants] : data.variants,
        options: defaultOption ? [defaultOption, ...data.options] : data.options,
      },
      {
        onSuccess: (product) => {
          if (product && selectedFiles.length > 0) {
            startUpload(selectedFiles, { product: product.id });
          }

          toast({
            title: "Produto Alterado.",
            description: `O produto ${product?.name} foi alterado`,
            className: "p-3",
          });

          navigation.push(`/products`);
        },

        onError: () => {
          toast({
            title: "Ops.",
            description: "Não foi possível alterar este produto.",
            className: "p-3",
            variant: "destructive",
          });
        },
      },
    );
  };

  return (
    <Form {...form}>
      <form className="space-y-4" action={() => onSubmit(form.getValues())}>
        <Card>
          <CardHeader>
            <CardTitle>{product.name}</CardTitle>
            <CardDescription>#{product.eid}</CardDescription>
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
                    <Editor
                      label="Descrição"
                      {...field}
                      initialValue={product.description ?? ""}
                      onChange={({ html }) => form.setValue("description", html)}
                    />
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
                      defaultSelected={selectedCollections}
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
              // @ts-expect-error name is not from schema
              name="cover"
              render={() => (
                <FormItem>
                  <FormControl>
                    <InputUpload
                      multiple
                      files={[...product.images.map((image) => image.url), ...selectedFiles]}
                      onRemoveFile={(file) => {
                        const isString = typeof file === "string";

                        if (isString) {
                          const image = product.images.find((i) => file === i.url);

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

        {/* @TODO Aqui tem alguns inputs com valores undefined, precisamos debugar */}
        <Card>
          <CardHeader>
            <h3 className="font-medium">Opções</h3>
          </CardHeader>

          {watched.length > 0 ? (
            <CardContent className="space-y-3">
              {cartesian(...watched.map(({ values }) => values as string[])).map((option, index) => (
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

        <SubmitButton text="Alterando..." className="bottom-4 w-full">
          Alterar produto
        </SubmitButton>
      </form>
    </Form>
  );
}
