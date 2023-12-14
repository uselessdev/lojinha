import { HomeIcon, KeyRoundIcon, LayersIcon, NewspaperIcon, SettingsIcon, WebhookIcon } from "lucide-react";

export const menu = [
  {
    name: "Dashboard",
    url: `/dashboard`,
    icon: <HomeIcon />,
    disabled: false,
    group: "",
  },
  {
    name: "Coleções",
    url: `/collections`,
    icon: <LayersIcon />,
    disabled: false,
    group: "Loja",
  },
  {
    name: "Chaves de API",
    url: `/keys`,
    icon: <KeyRoundIcon />,
    disabled: false,
    group: "Configurações",
  },
  {
    name: "Webhooks",
    url: `/webhooks`,
    icon: <WebhookIcon />,
    disabled: false,
    group: "Configurações",
  },
  {
    name: "Loja",
    url: `/settings`,
    icon: <SettingsIcon />,
    disabled: false,
    group: "Configurações",
  },
  {
    name: "Eventos",
    url: `/events`,
    icon: <NewspaperIcon />,
    disabled: false,
    group: "Configurações",
  },
];

export const groups = [...new Set(menu.map(({ group }) => group))];
