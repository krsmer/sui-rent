"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface FadeInProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
  direction?: "up" | "down" | "left" | "right" | "none"
}

export function FadeIn({ children, delay = 0, duration = 500, className, direction = "up" }: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true)
          }, delay)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [delay])

  const directionClasses = {
    up: "translate-y-8",
    down: "-translate-y-8",
    left: "translate-x-8",
    right: "-translate-x-8",
    none: "",
  }

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all",
        !isVisible && `opacity-0 ${directionClasses[direction]}`,
        isVisible && "opacity-100 translate-x-0 translate-y-0",
        className,
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  )
}
