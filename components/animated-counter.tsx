"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
  prefix?: string
  suffix?: string
}

export function AnimatedCounter({ value, duration = 2000, className, prefix = "", suffix = "" }: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const countRef = useRef(0)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }

      const progress = timestamp - startTimeRef.current
      const percentage = Math.min(progress / duration, 1)

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - percentage, 4)
      const currentCount = Math.floor(easeOutQuart * value)

      setCount(currentCount)
      countRef.current = currentCount

      if (percentage < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(value)
      }
    }

    startTimeRef.current = null
    requestAnimationFrame(animate)
  }, [value, duration])

  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}
