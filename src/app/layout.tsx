import * as React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";
import { Metadata, Viewport } from "next";
import { ThemeProvider } from "~/components/theme/provider";
import "~/app/globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#fefefe" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "lojinha",
    template: "%s | Lojinha",
  },
  description: "Uma plataforma de e-commerce headless para desenvolvedores front-end.",
  icons: [
    { rel: "apple-touch-icon", url: "./apple-touch-icon.png" },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      url: "/favicon-32x32.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      url: "/favicon-16x16.png",
    },
  ],
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <ClerkProvider localization={ptBR} appearance={{ variables: { colorPrimary: "#000000" } }}>
        <body>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </body>
      </ClerkProvider>
    </html>
  );
}
