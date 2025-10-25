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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryClientProvider client={queryClient}>
          <SuiClientProvider networks={networks} defaultNetwork="testnet">
            <WalletProvider>
              <header className="border-b sticky top-0 bg-gray-300  backdrop-blur-sm z-10">
                <div className="container mx-auto flex items-center justify-between p-4">
                  <h1 className="text-lg font-semibold">SuiRent</h1>
                  <ConnectButton />
                </div>
              </header>
              <main className="container mx-auto p-4">{children}</main>
            </WalletProvider>
          </SuiClientProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}