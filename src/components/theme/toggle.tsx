"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";

export function ToggleColorScheme() {
  const { theme, setTheme } = useTheme();

  const toggle = () => (theme === "light" ? setTheme("dark") : setTheme("light"));

  return (
    <Button onClick={toggle} variant="outline" size="icon" className="h-8">
      <SunIcon className="h-4 w-4 transition-all dark:-rotate-90 dark:scale-0" />
      <MoonIcon className="absolute h-4 w-4 scale-0 transition-all dark:scale-100" />
      <span className="sr-only">Alterar Tema</span>
    </Button>
  );
}
