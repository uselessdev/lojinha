"use client";

import * as CNPJ from "@fnando/cnpj";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Email, Store } from "~/lib/db";
import { SettingsSchema, settingsSchema } from "../schema";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Autocomplete, Option } from "~/components/autocomplete";
import { updateStoreAction } from "../actions";
import { useFormState } from "react-dom";
import { SubmitButton } from "~/components/submit-button";
import { Toast } from "~/components/toast";

type Props = {
  store?: Omit<Store, "emails"> & { emails: Email[] };
};

export function SettingsForm({ store }: Props) {
  const { user } = useUser();
  const { organization, memberships } = useOrganization({ memberships: true });

  const [state, mutate] = useFormState(updateStoreAction, undefined);

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

  return (
    <>
      <Form {...form}>
        <form className="space-y-4" action={() => mutate(form.getValues())}>
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
                <FormDescription>
                  Se sua loja não tiver um domínio você pode deixar este campo em branco.
                </FormDescription>
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
                  Os e-mails configurados aqui serão utilizados para envio de notificações, por exemplo, quando uma
                  compra ocorrer na sua loja.
                </FormDescription>
              </FormItem>
            )}
          />

          <SubmitButton>Alterar</SubmitButton>
        </form>
      </Form>

      <Toast open={state?.success} title="Alterada" description="As alterações foram salvas." />

      <Toast
        open={state && !state?.success}
        title="Falhou"
        description="Ocorreu um problema ao tentar salvar suas alterações, tente novamente ou entre em contato com o suporte."
        variant="destructive"
      />
    </>
  );
}
