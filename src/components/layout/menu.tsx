import { HomeIcon, NewspaperIcon, WebhookIcon } from "lucide-react";

export const menu = [
  {
    name: "Dashboard",
    url: `/dashboard`,
    icon: <HomeIcon />,
    disabled: false,
    group: "",
  },

  {
    name: "Webhooks",
    url: `/webhooks`,
    icon: <WebhookIcon />,
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
