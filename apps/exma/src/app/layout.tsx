import clsx from "clsx";

import { Lato, Open_Sans } from "next/font/google";
import "@saitamafun/wallet/css/index.css";

import "../index.css";
import type { Metadata } from "next";

const defaultFont = Open_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
});

const monoFont = Lato({
  weight: ["700", "900"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Saitama | Ondemand wallet for your dapp",
  description:
    "Spin up ondemand wallets and customizable transaction flow for all users. Process transactions without leaving dapp.",
  openGraph: {
    url: new URL("https://wallet.saitama.fun/"),
    images: ["https://wallet.saitama.fun/banner.png"],
  },
};

export default function App({ children }: React.PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
      </head>
      <body
        className={clsx(
          defaultFont.variable,
          monoFont.variable,
          "fixed inset-0 flex flex-col font-sans"
        )}
      >
        {children}
      </body>
    </html>
  );
}
