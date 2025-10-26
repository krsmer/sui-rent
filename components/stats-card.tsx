import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface StatsCardProps {
  title: string
  value: string | number | ReactNode
  description?: string
  icon: LucideIcon
  trend?: {
    value: string
    isPositive: boolean
  }
  className?: string
}

export function StatsCard({ title, value, description, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-lg hover:border-primary/50", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
            {trend && (
              <div className="flex items-center gap-1 text-xs">
                <span className={cn("font-medium", trend.isPositive ? "text-green-500" : "text-red-500")}>
                  {trend.isPositive ? "↑" : "↓"} {trend.value}
                </span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
