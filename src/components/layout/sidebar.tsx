"use client";

import { useOrganization } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import { groups, menu } from "./menu";

export function Sidebar() {
  const pathname = usePathname();
  const { organization } = useOrganization();

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group} className="space-y-2">
          {group ? <span className="px-2 text-xs font-medium uppercase text-muted-foreground">{group}</span> : null}

          <nav>
            {menu
              .filter((i) => i.group === group)
              .map((item) => (
                <Link
                  key={item.url}
                  href={`/${organization?.id}${item.url}`}
                  className={cn(
                    `flex items-center gap-2 rounded-sm px-2 py-2 text-sm font-medium text-foreground/50 hover:bg-foreground/5`,
                    {
                      "bg-muted-foreground/5 text-foreground": pathname.startsWith(`/${organization?.id}${item.url}`),
                    },
                  )}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
          </nav>
        </div>
      ))}
    </div>
  );
}
