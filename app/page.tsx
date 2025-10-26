import Link from "next/link"
import { ArrowRight, Shield, Zap, Coins, TrendingUp, Users, Package } from "lucide-react"
import SplitText from "@/components/SplitText"
import { StatsCard } from "@/components/stats-card"
import { FeatureCard } from "@/components/feature-card"
import { AnimatedCounter } from "@/components/animated-counter"
import { FadeIn } from "@/components/fade-in"
import { StaggerContainer } from "@/components/stagger-container"

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="container flex flex-col items-center justify-center gap-8 px-4 py-24 md:py-32 lg:py-40">
        <div className="flex max-w-4xl flex-col items-center gap-6 text-center">
          <FadeIn delay={100}>
            <div className="inline-flex items-center rounded-full border border-border bg-muted px-4 py-1.5 text-sm text-muted-foreground">
              <Zap className="mr-2 h-3 w-3" />
              Powered by SuiRent
            </div>
          </FadeIn>

          <SplitText
            text="Rent NFTs Without Buying Them"
            tag="h1"
            className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            splitType="words"
            delay={50}
          />

          <FadeIn delay={300}>
            <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed md:text-xl">
              Access valuable digital assets temporarily. Earn passive income from your NFTs. All secured by smart
              contracts on Sui blockchain.
            </p>
          </FadeIn>

          <FadeIn delay={400}>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/marketplace"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Browse Marketplace
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/my-assets"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                List Your Assets
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t border-border/40 bg-muted/30 py-16 md:py-24">
        <div className="container px-4">
          <FadeIn>
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Platform Statistics</h2>
              <p className="mt-2 text-muted-foreground">Real-time metrics from our growing marketplace</p>
            </div>
          </FadeIn>
          <StaggerContainer staggerDelay={100} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total NFTs Listed"
              value={<AnimatedCounter value={1247} />}
              icon={Package}
              trend={{ value: "12%", isPositive: true }}
            />
            <StatsCard
              title="Active Rentals"
              value={<AnimatedCounter value={342} />}
              icon={TrendingUp}
              trend={{ value: "8%", isPositive: true }}
            />
            <StatsCard
              title="Total Users"
              value={<AnimatedCounter value={5823} />}
              icon={Users}
              trend={{ value: "23%", isPositive: true }}
            />
            <StatsCard
              title="Volume (SUI)"
              value={<AnimatedCounter value={12450} suffix=" SUI" />}
              icon={Coins}
              trend={{ value: "15%", isPositive: true }}
            />
          </StaggerContainer>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border/40 py-16 md:py-24">
        <div className="container px-4">
          <FadeIn>
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Why Choose SuiRent?</h2>
              <p className="mt-2 text-muted-foreground">Everything you need for secure NFT rentals</p>
            </div>
          </FadeIn>
          <StaggerContainer staggerDelay={150} className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={Shield}
              title="Secure & Trustless"
              description="Smart contracts ensure your assets are protected. No intermediaries needed."
            />
            <FeatureCard
              icon={Zap}
              title="Fast & Efficient"
              description="Instant rentals powered by Sui's high-performance blockchain."
            />
            <FeatureCard
              icon={Coins}
              title="Earn Passive Income"
              description="List your idle NFTs and earn SUI tokens while others use them."
            />
          </StaggerContainer>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container px-4 py-16 md:py-24">
        <FadeIn>
          <div className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-card p-8 text-center md:p-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Ready to Get Started?</h2>
            <p className="max-w-2xl text-muted-foreground leading-relaxed md:text-lg">
              Connect your wallet and start exploring the marketplace. Rent NFTs for gaming, events, or any temporary
              use case.
            </p>
            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Explore Marketplace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </FadeIn>
      </section>
    </div>
  )
}
