"use client";

import { CreateOrganization, useOrganizationList } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { MoveRightIcon } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { ToggleColorScheme } from "~/components/theme/toggle";
import { Avatar, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export default function StoreSelectionPage() {
  const { theme } = useTheme();
  const { userMemberships } = useOrganizationList({
    userMemberships: { infinite: true },
  });

  if (userMemberships.isLoading) {
    return null;
  }

  const stores = userMemberships.isLoading ? [] : userMemberships.data ?? [];

  if (stores.length <= 0) {
    return (
      <section className="grid h-[100dvh] w-full place-items-center">
        <CreateOrganization
          appearance={{ baseTheme: theme === "dark" ? dark : undefined }}
          afterCreateOrganizationUrl={({ id }) => `/${id}/dashboard`}
        />
      </section>
    );
  }

  return (
    <section className="grid h-[100dvh] w-full place-items-center">
      <section className="flex w-full max-w-md flex-col gap-3">
        <h2 className="scroll-m-20 text-xl font-semibold tracking-tight">Selecione uma loja</h2>

        {stores?.map((store) => (
          <Card key={store.id}>
            <CardHeader className="flex flex-row gap-2">
              <div className="flex flex-1 flex-row items-center gap-2">
                <Avatar>
                  <AvatarImage src={store.organization.imageUrl} alt={store.organization.name} />
                </Avatar>

                <div>
                  <CardTitle>{store.organization.name}</CardTitle>
                  <CardDescription>{store.organization.slug}</CardDescription>
                </div>
              </div>

              <Button size="sm" variant="outline" asChild>
                <Link href={`${store.organization.id}/dashboard`}>
                  <MoveRightIcon />
                </Link>
              </Button>
            </CardHeader>
          </Card>
        ))}

        <ToggleColorScheme />
      </section>
    </section>
  );
}
