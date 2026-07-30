﻿'use client'

import { useState, useCallback, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import {
  Search,
  Menu,
  Bell,
  Moon,
  Sun,
  ChevronRight,
  Home,
  Command,
} from 'lucide-react'

import { cn } from '@/lib/cn'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// 
// Constants
// 

const BREADCRUMB_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  expenses: 'Expenses',
  approvals: 'Approvals',
  company: 'Company',
  departments: 'Departments',
  employees: 'Employees',
  budgets: 'Budgets',
  vendors: 'Vendors',
  analytics: 'Analytics',
  reports: 'Reports',
  'tax-reports': 'Tax Reports',
  admin: 'Admin Panel',
  'audit-logs': 'Audit Logs',
  ai: 'AI Assistant',
  settings: 'Settings',
  profile: 'Profile',
  new: 'New',
}

// 
// Helpers
// 

/**
 * Get the user's initials for the avatar fallback.
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Generate breadcrumb segments from the current pathname.
 */
function generateBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) {
    return [{ label: 'Dashboard', href: '/dashboard' }]
  }

  const crumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    const label = BREADCRUMB_LABELS[segment] ?? segment.replace(/-/g, ' ')
    return {
      label: label.charAt(0).toUpperCase() + label.slice(1),
      href,
    }
  })

  return crumbs
}

/**
 * Format a number for the notification badge.
 */
function formatBadgeCount(count: number): string {
  if (count > 99) return '99+'
  return String(count)
}

// 
// Component
// 

export function Header() {
  const pathname = usePathname()
  const router = useRouter()

  //  Store 

  const setTheme = useUIStore((s) => s.setTheme)
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen)
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen)

  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  //  Local state 

  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Mock notification count — replace with live query
  const [unreadCount] = useState(3)

  //  Scroll detection 

  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (y) => {
    setIsScrolled(y > 10)
  })

  //  Keyboard shortcut (Ctrl+K) 

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [setCommandPaletteOpen])

  //  Breadcrumbs 

  const breadcrumbs = generateBreadcrumbs(pathname)

  //  Theme toggle handler 

  const handleThemeToggle = useCallback(
    (checked: boolean) => {
      setTheme(checked ? 'dark' : 'light')
    },
    [setTheme],
  )

  //  Derive dark state 
  // We need to check the actual DOM class
  const [actualDark, setActualDark] = useState(false)

  useEffect(() => {
    const check = () => {
      setActualDark(document.documentElement.classList.contains('dark'))
    }
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, { attributes: true })
    return () => observer.disconnect()
  }, [])

  //  Render 

  return (
    <motion.header
      initial={false}
      className={cn(
        'sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b px-4 transition-colors duration-300 sm:px-6',
        'bg-white/70 backdrop-blur-xl dark:bg-gray-950/70',
        isScrolled
          ? 'border-gray-200/80 shadow-sm dark:border-gray-800/80'
          : 'border-transparent',
      )}
    >
      {/*  Mobile menu toggle  */}
      <Button
        variant="ghost"
        size="icon"
        className="-ml-2 lg:hidden"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/*  Breadcrumb  */}
      <nav aria-label="Breadcrumb" className="hidden min-w-0 sm:block">
        <ol className="flex items-center gap-1.5 text-sm">
          <li>
            <Link
              href="/dashboard"
              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            >
              <Home className="h-4 w-4" />
              <span className="sr-only">Home</span>
            </Link>
          </li>

          {breadcrumbs.map((crumb, index) => (
            <li key={crumb.href} className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />
              {index === breadcrumbs.length - 1 ? (
                <span
                  className="truncate font-medium text-gray-900 dark:text-white"
                  aria-current="page"
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="truncate text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/*  Spacer  */}
      <div className="flex-1" />

      {/*  Search bar  */}
      <motion.div
        animate={{
          width: isSearchFocused ? 320 : 200,
        }}
        transition={{ duration: 0.2, ease: 'easeOut' as const }}
        className="relative hidden md:block"
      >
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className={cn(
            'h-9 w-full rounded-lg border bg-gray-50 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200',
            'border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20',
            'dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-400/20',
          )}
          aria-label="Search"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded border border-gray-200 bg-white px-1.5 font-mono text-[10px] font-medium text-gray-400 lg:inline-flex dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500">
          <Command className="h-2.5 w-2.5" />
          K
        </kbd>
      </motion.div>

      {/*  Command palette trigger  */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setCommandPaletteOpen(true)}
        aria-label="Open command palette"
      >
        <Search className="h-5 w-5" />
      </Button>

      {/*  Theme toggle  */}
      <div className="flex items-center gap-2">
        <Sun className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        <Switch
          checked={actualDark}
          onCheckedChange={handleThemeToggle}
          aria-label="Toggle dark mode"
          className="data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-500"
        />
        <Moon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
      </div>

      {/*  Notifications  */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        asChild
      >
        <Link href="/notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white dark:ring-gray-950">
              {formatBadgeCount(unreadCount)}
            </span>
          )}
        </Link>
      </Button>

      {/*  User dropdown  */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="User menu"
          >
            <Avatar className="h-8 w-8 ring-2 ring-gray-200/50 dark:ring-gray-700/50">
              {user?.photoURL ? (
                <AvatarImage src={user.photoURL} alt={user.displayName} />
              ) : null}
              <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-xs font-semibold text-blue-700 dark:from-blue-900/50 dark:to-indigo-900/50 dark:text-blue-300">
                {user ? getInitials(user.displayName) : 'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-64"
          align="end"
          sideOffset={8}
        >
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.displayName ?? 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email ?? ''}
              </p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => router.push('/settings/profile')}>
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => router.push('/settings')}>
              Settings
              <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => setCommandPaletteOpen(true)}>
              Command Palette
              <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                const isDark = document.documentElement.classList.contains('dark')
                setTheme(isDark ? 'light' : 'dark')
              }}
            >
              {actualDark ? 'Light Mode' : 'Dark Mode'}
              <DropdownMenuShortcut>
                {actualDark ? '☀️' : '🌙'}
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
            onSelect={() => logout()}
          >
            Sign Out
            <DropdownMenuShortcut>⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.header>
  )
}
