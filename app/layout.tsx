import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree } from "next/font/google";

import TawkToWidget from "@/components/Tawkto/page";
import { Providers } from "@/components/Providers";
import { cn } from "@/lib/utils";

import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Web3GlobalVault",
    template: "%s | Web3GlobalVault",
  },

  description: "Financial Freedom and Independence",

  icons: {
    icon: "/tiv-logo.png",
    shortcut: "/tiv-logo.png",
    apple: "/tiv-logo.png",
  },

  openGraph: {
    title: "Web3GlobalVault",
    description: "Financial Freedom and Independence",
    images: [
      {
        url: "/web3global.jpeg",
        width: 1200,
        height: 630,
        alt: "Web3GlobalVault",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Web3GlobalVault",
    description: "Financial Freedom and Independence",
    images: ["/web3global.jpeg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("font-sans", figtree.variable)}
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-app`}
      >
        <Providers>
          <TawkToWidget />
          {children}
        </Providers>
      </body>
    </html>
  );
}
