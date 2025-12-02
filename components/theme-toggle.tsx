"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <Sun className="h-4 w-4" />
        <Switch disabled />
        <Moon className="h-4 w-4" />
      </div>
    )
  }

  const isDark = theme === "dark"

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Sun className={cn("h-4 w-4", !isDark ? "text-primary" : "text-muted-foreground")} />
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => {
          setTheme(checked ? "dark" : "light")
        }}
        aria-label="Toggle theme"
      />
      <Moon className={cn("h-4 w-4", isDark ? "text-primary" : "text-muted-foreground")} />
    </div>
  )
}