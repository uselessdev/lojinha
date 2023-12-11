import { HomeIcon } from "lucide-react";

export const menu = [
  {
    name: "Dashboard",
    url: `/dashboard`,
    icon: <HomeIcon />,
    disabled: false,
    group: "",
  },
];

export const groups = [...new Set(menu.map(({ group }) => group))];
