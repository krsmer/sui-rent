"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ConnectButton } from "@mysten/dapp-kit"
import { Package, Store } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <nav className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-primary to-accent">
            <span className="text-primary-foreground font-bold text-sm">SR</span>
          </div>
          <span className="hidden sm:inline-block">SuiRent</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-2 md:gap-4">
          <Link
            href="/marketplace"
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
              isActive("/marketplace") ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            }`}
          >
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline-block">Marketplace</span>
          </Link>

          <Link
            href="/my-assets"
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
              isActive("/my-assets") ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            }`}
          >
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline-block">My Assets</span>
          </Link>

          {/* Wallet Connect Button */}
          <ConnectButton />
        </div>
      </nav>
    </header>
  )
}
