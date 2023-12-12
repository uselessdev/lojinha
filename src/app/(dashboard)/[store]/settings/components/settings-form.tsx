"use client";

import * as CNPJ from "@fnando/cnpj";
import { useOrganization, useUser } from "@clerk/nextjs";
import { Loader2Icon } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Email, Store } from "~/lib/db";
import { SettingsSchema, settingsSchema } from "../schema";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Autocomplete, Option } from "~/components/autocomplete";
import { useToast } from "~/components/ui/use-toast";
import { updateStoreAction } from "../actions";
import { useServerAction } from "~/lib/actions/use-server-action";

type Props = {
  store?: Omit<Store, "emails"> & { emails: Email[] };
};

export function SettingsForm({ store }: Props) {
  const { user } = useUser();
  const { organization, memberships } = useOrganization({ memberships: true });

  const { mutate, isLoading } = useServerAction(updateStoreAction);
  const { toast } = useToast();

  const members: Option[] = memberships?.isLoading
    ? []
    : (memberships?.data ?? []).map((member) => ({
        label: member.publicUserData.identifier,
        value: member.publicUserData.identifier,
      }));

  const custom: Option[] = (store?.emails ?? []).map((email) => ({
    label: email.address,
    value: email.address,
  }));

  const options = [...members, ...custom].reduce<Array<Option>>((items, item) => {
    const exists = items.some(({ label }) => label === item.label);

    if (!exists) {
      items.push(item);
    }

    return items;
  }, []);

  const form = useForm<SettingsSchema>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: organization?.name,
      cnpj: store?.cnpj ?? "",
      url: store?.url ?? "",
      emails: store ? store.emails.map((email) => email.address) : [user?.emailAddresses.at(0)?.emailAddress],
    },
  });

  const onSubmit: SubmitHandler<SettingsSchema> = (data) => {
    mutate(data, {
      onSuccess: () => {
        toast({
          title: "Atualizada",
          description: "Os dados da loja foram salvos",
          className: "p-3",
        });
      },
      onError: () => {
        toast({
          title: "Ops",
          description: "Ocorreu um erro ao tentar salvar suas alterações.",
          className: "p-3",
        });
      },
    });
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} readOnly />
              </FormControl>
              <FormDescription>Para alterar o nome da sua loja, utilize o menu acima.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input placeholder="https://acme.lojinha.dev" {...field} />
              </FormControl>
              <FormDescription>Se sua loja não tiver um domínio você pode deixar este campo em branco.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cnpj"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CNPJ</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(event) => {
                    form.setValue("cnpj", CNPJ.format(event.target.value));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="emails"
          render={() => (
            <FormItem>
              <FormLabel>E-mails</FormLabel>
              <Autocomplete
                options={options}
                defaultSelected={form.getValues("emails").map((email) => ({ label: email, value: email }))}
                name="emails"
                onChange={({ target }) => {
                  form.setValue(
                    "emails",
                    target.value.map(({ value }) => value as string),
                  );
                }}
                createWhenNotExists
              />
              <FormDescription>
                Os e-mails configurados aqui serão utilizados para envio de notificações, por exemplo, quando uma compra
                ocorrer na sua loja.
              </FormDescription>
            </FormItem>
          )}
        />

        <Button size="sm" className="w-[160px]" aria-disabled>
          {isLoading ? (
            <>
              <Loader2Icon className="animate-spin" />
              <span className="sr-only">Atualizando</span>
            </>
          ) : (
            "Alterar"
          )}
        </Button>
      </form>
    </Form>
  );
}
