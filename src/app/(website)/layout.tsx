import * as React from "react";
import { MoveUpRightIcon } from "lucide-react";
import { Logo } from "~/components/layout/logo";
import { ToggleColorScheme } from "~/components/theme/toggle";
import { SignIn } from "~/components/signin";

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="container mx-auto flex h-20 items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="flex items-center gap-1">
            <Logo className="h-8 w-8" />
            <span className="sr-only">lojinha.dev</span>
          </h1>

          <a
            href="https://docs.lojinha.dev"
            className="flex items-center gap-1 text-sm font-medium text-foreground/70 outline-none hover:text-foreground focus:text-foreground"
          >
            Documentação
            <MoveUpRightIcon className="h-4 w-4" />
          </a>
        </div>

        <nav className="flex items-center gap-4">
          <SignIn />
        </nav>
      </header>

      <main className="container mx-auto">{children}</main>

      <footer className="container mx-auto flex h-20 items-center justify-between">
        <div className="flex items-center gap-2">
          <ToggleColorScheme />
          <span className="text-xs text-foreground/70">&copy; {new Date().getFullYear()} lojinha.dev</span>
        </div>
      </footer>
    </>
  );
}
