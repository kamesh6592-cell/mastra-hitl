"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { ThemeSwitcher } from "@/components/ui/shadcn-io/theme-switcher"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()

  return (
    <ThemeSwitcher
      value={theme as 'light' | 'dark' | 'system'}
      onChange={setTheme}
      className={className}
    />
  )
}