import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree } from "next/font/google";
import "./globals.css";
import TawkToWidget from "@/components/Tawkto/page";
import { cn } from "@/lib/utils";

const figtree = Figtree({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Genesis Bank-Investment",
  description: "Financial Freedom and Independence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", figtree.variable)}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-app __processed_a4927776-6fde-4654-8bb4-813aff7a0597__="true"`}>
        <TawkToWidget />
        {children}
      </body>
    </html>
  );
}