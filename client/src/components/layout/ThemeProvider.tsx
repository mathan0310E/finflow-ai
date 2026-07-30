'use client'

import { useEffect, useCallback, type ReactNode } from 'react'
import { useUIStore, type Theme } from '@/stores/ui-store'

// 
// Props
// 

interface ThemeProviderProps {
  children: ReactNode
  /** Optional attribute to apply the class on (defaults to `html`) */
  attribute?: string
}

// 
// Helpers
// 

/**
 * Resolve the effective theme based on the stored preference and system
 * preference.
 */
function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
  return theme
}

/**
 * Apply or remove the `dark` class on the target element.
 */
function applyTheme(theme: Theme, target: HTMLElement) {
  const resolved = resolveTheme(theme)
  target.classList.toggle('dark', resolved === 'dark')
}

// 
// Component
// 

/**
 * Theme provider that syncs the Zustand `theme` preference to the DOM.
 *
 * - Applies the `dark` class to `<html>` (or a custom `attribute`).
 * - Listens for `prefers-color-scheme` changes when the preference is `system`.
 * - Persists the preference via the `useUIStore` persist middleware.
 *
 * @example
 * ```tsx
 * // In your root layout:
 * <ThemeProvider>
 *   <body>{children}</body>
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({
  children,
  attribute = 'html',
}: ThemeProviderProps) {
  const theme = useUIStore((state) => state.theme)
  const setTheme = useUIStore((state) => state.setTheme)

  //  Apply theme on mount and on change 

  useEffect(() => {
    const target: HTMLElement =
      attribute === 'html'
        ? document.documentElement
        : (document.querySelector(attribute) ?? document.documentElement)

    applyTheme(theme, target)
  }, [theme, attribute])

  //  Listen for system preference changes 

  const handleSystemChange = useCallback(
    (e: MediaQueryListEvent) => {
      const currentTheme = useUIStore.getState().theme
      if (currentTheme === 'system') {
        const target: HTMLElement =
          attribute === 'html'
            ? document.documentElement
            : (document.querySelector(attribute) ?? document.documentElement)
        target.classList.toggle('dark', e.matches)
      }
    },
    [attribute],
  )

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    mql.addEventListener('change', handleSystemChange)
    return () => mql.removeEventListener('change', handleSystemChange)
  }, [handleSystemChange])

  return <>{children}</>
}
