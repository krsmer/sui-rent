"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@mysten/dapp-kit/dist/index.css";

import { getFullnodeUrl } from "@mysten/sui/client";
import {
  SuiClientProvider,
  WalletProvider,
} from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { useState } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const networks = {
  testnet: { url: "https://fullnode.testnet.sui.io:443" },
  devnet: { url: getFullnodeUrl("devnet") },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans`}
      >
        <QueryClientProvider client={queryClient}>
          <SuiClientProvider networks={networks} defaultNetwork="testnet">
            <WalletProvider autoConnect>
              <Navigation />
              <main className="min-h-screen">{children}</main>
            </WalletProvider>
          </SuiClientProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}