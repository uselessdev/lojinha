"use client";

import { useOrganization } from "@clerk/nextjs";
import { intlFormatDistance } from "date-fns";
import { Skeleton } from "~/components/ui/skeleton";
import { Event } from "~/lib/db";

export function getEventAction(event: Event["action"]) {
  return {
    CREATE_ACCOUNT: `criou a conta 🎉`,
    CREATE_STORE: `criou a loja 🏗`,
    UPDATE_STORE: `atualizou as informações da loja 🔧`,
    CREATE_COLLECTION: `criou uma coleção 🗂`,
    UPDATE_COLLECTION: `atualizou uma coleção 🔧`,
    // CREATE_PRODUCT: `criou um produto 🏷`,
    // UPDATE_PRODUCT: `atualizou um produto 🔨`,
    // ARCHIVE_COLLECTION: `arquivou uma coleção 🗄`,
    // UNARCHIVE_COLLECTION: `restaurou uma coleção 🔖`,
    // DELETE_COLLECTION: `removeu uma coleção 🪓`,
    // ARCHIVE_PRODUCT: `arquivou um produto 🗄`,
    // UNARCHIVE_PRODUCT: `restaurou um produto 🗃`,
    // DELETE_PRODUCT: `removeu um produto 🗑️`,
    CREATE_KEY: `criou uma chave 🔑`,
    REVOKE_KEY: `revogou uma chave 🔐`,
    // CREATE_ORDER: `carrinho criado 🛒`,
    // UPDATE_ORDER: `carrinho atualizado 🛒`,
    // ARCHIVE_ORDER: `carrinho excluido 🛒`,
    // EXPIRED_ORDER: `carrinho expirado 🛒`,
  }[event];
}

export function EventRow(props: Event) {
  const { memberships, organization } = useOrganization({ memberships: { infinite: true } });

  if (!organization || !memberships || memberships?.isLoading) {
    return <Skeleton className="h-5 w-full" />;
  }

  const user = memberships?.data?.find(({ publicUserData }) => {
    return publicUserData.userId === props.actor;
  });

  return (
    <p>
      <strong>{user ? user.publicUserData.firstName : `🤖 ${organization?.name}`} </strong>
      {getEventAction(props.action)} {intlFormatDistance(props.createdAt as Date, new Date(), { locale: "pt-BR" })}
    </p>
  );
}
