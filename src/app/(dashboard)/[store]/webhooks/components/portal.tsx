"use client";

import { useTheme } from "next-themes";
import { AppPortal } from "svix-react";

type Props = {
  url: string;
};

export function Portal({ url }: Props) {
  const { theme } = useTheme();

  return (
    <div className="relative min-h-[calc(100dvh-120px)] [&>*]:h-[calc(100dvh-120px)] [&>*]:rounded-md [&>*]:border">
      <AppPortal url={url} darkMode={theme === "dark"} />
    </div>
  );
}
