"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@mysten/dapp-kit/dist/index.css";

import { getFullnodeUrl } from "@mysten/sui/client";
import {
  SuiClientProvider,
  WalletProvider,
  ConnectButton,
} from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const queryClient = new QueryClient();
const networks = {
  testnet: { url: getFullnodeUrl("testnet") },
  devnet: { url: getFullnodeUrl("devnet") },
};

// Metadata export'u, bu dosya "use client" olarak işaretlendiği için kaldırıldı.
// export const metadata: Metadata = {
//   title: "Sui Asset Rental",
//   description: "A decentralized asset rental marketplace on Sui.",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans`}
      >
        <QueryClientProvider client={queryClient}>
          <SuiClientProvider networks={networks} defaultNetwork="devnet">
            <WalletProvider autoConnect>
              <header className="bg-gray-900 text-white p-4">
                <div className="container mx-auto flex justify-between items-center">
                  <Link href="/" className="text-2xl font-bold">
                    SuiRent
                  </Link>
                  <nav className="flex items-center space-x-4">
                    <Link href="/marketplace" className="hover:text-gray-300">
                      Marketplace
                    </Link>
                    <Link href="/my-assets" className="hover:text-gray-300">
                      My Assets
                    </Link>
                    <ConnectButton />
                  </nav>
                </div>
              </header>
              <main>{children}</main>
            </WalletProvider>
          </SuiClientProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}