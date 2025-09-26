import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Link } from "@heroui/link";
import clsx from "clsx";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";

import "@/styles/app.css";

const repoBase = process.env.NEXT_PUBLIC_REPO_BASE || '';

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: `${repoBase}/Pokeball.png`,
    // icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        suppressHydrationWarning
        className={clsx(
          "min-h-screen font-sans antialiased appBackground",
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          {/* <div className="relative flex flex-col h-screen">
            <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow"> */}
          <div>
            <main>
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
