"use client";

import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export function Header() {
  const { theme } = useTheme();

  return (
    <>
      <OrganizationSwitcher
        hidePersonal
        appearance={{
          elements: {
            rootBox: "h-8",
            organizationSwitcherPopoverActionButton__createOrganization: {
              display: "none",
            },
          },
          baseTheme: theme === "dark" ? dark : undefined,
        }}
      />
      <UserButton appearance={{ baseTheme: theme === "dark" ? dark : undefined }} />
    </>
  );
}
