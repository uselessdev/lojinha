import * as React from "react";
import { Logo } from "~/components/layout/logo";
import { Sidebar } from "~/components/layout/sidebar";
import { Header } from "~/components/layout/header";
import { ToggleColorScheme } from "~/components/theme/toggle";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-[100dvh] w-full grid-cols-[280px_1fr]">
      <aside className="flex flex-col p-4">
        <header className="flex h-16 items-center px-2">
          <Logo className="h-6 w-6" />
        </header>

        <Sidebar />

        <div className="mt-auto px-2">
          <ToggleColorScheme />
        </div>
      </aside>

      <div className="py-4 pr-4">
        <header className="flex h-16 items-center justify-end gap-3">
          <Header />
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}
