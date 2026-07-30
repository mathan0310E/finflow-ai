'use client'

import {
  useCallback,
  useMemo,
  type ElementType,
} from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Receipt,
  CheckCircle2,
  Building2,
  GitBranch,
  Users,
  PiggyBank,
  Store,
  BarChart3,
  FileText,
  FileSpreadsheet,
  Shield,
  ClipboardList,
  Bot,
  Plus,
  ChevronLeft,
  ChevronRight,
  LogOut,
  LifeBuoy,
} from 'lucide-react'

import { cn } from '@/lib/cn'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'
import { APP_NAME } from '@/constants'
import type { UserRole } from '@/types'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'

// 
// Types
// 

interface NavItem {
  label: string
  href: string
  icon: ElementType
  badge?: number
}

interface NavSection {
  title: string
  items: NavItem[]
  /** If omitted, visible to all authenticated users. */
  roles?: UserRole[]
}

// 
// Navigation definition
// 

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      {
        label: 'Expenses',
        href: '/expenses',
        icon: Receipt,
      },
      {
        label: 'Approvals',
        href: '/approvals',
        icon: CheckCircle2,
        badge: 0, // Will be replaced by live data
      },
      { label: 'Help Center', href: '/help', icon: LifeBuoy },
    ],
  },
  {
    title: 'Management',
    roles: ['ceo', 'finance_manager'],
    items: [
      { label: 'Company', href: '/company', icon: Building2 },
      { label: 'Departments', href: '/departments', icon: GitBranch },
      { label: 'Employees', href: '/employees', icon: Users },
      { label: 'Budgets', href: '/budgets', icon: PiggyBank },
      { label: 'Vendors', href: '/vendors', icon: Store },
    ],
  },
  {
    title: 'Reports',
    roles: ['ceo', 'finance_manager'],
    items: [
      { label: 'Analytics', href: '/analytics', icon: BarChart3 },
      { label: 'Reports', href: '/reports', icon: FileText },
      { label: 'Tax Reports', href: '/tax-reports', icon: FileSpreadsheet },
    ],
  },
  {
    title: 'Admin',
    roles: ['super_admin'],
    items: [
      { label: 'Admin Panel', href: '/admin', icon: Shield },
      { label: 'Audit Logs', href: '/audit-logs', icon: ClipboardList },
    ],
  },
  {
    title: 'AI',
    items: [
      { label: 'AI Assistant', href: '/ai', icon: Bot },
    ],
  },
]

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

// 
// Sub-components
// 

/**
 * Premium gradient logo.
 */
function SidebarLogo({ collapsed }: { collapsed: boolean }) {
  return (
    <Link
      href="/dashboard"
      className={cn(
        'flex items-center gap-3 px-5 py-5',
        collapsed && 'justify-center px-0',
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
        <span className="text-sm font-bold text-white">F</span>
      </div>

      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' as const }}
            className="flex flex-col overflow-hidden"
          >
            <span className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">
              {APP_NAME}
            </span>
            <span className="text-[10px] leading-tight text-gray-500 dark:text-gray-400">
              Enterprise
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </Link>
  )
}

/**
 * Individual navigation item.
 */
function NavItemComponent({
  item,
  collapsed,
  isActive,
}: {
  item: NavItem
  collapsed: boolean
  isActive: boolean
}) {
  const Icon = item.icon

  const linkContent = (
    <div
      className={cn(
        'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
        isActive
          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100',
        collapsed && 'justify-center px-2',
      )}
    >
      {/* Active indicator bar */}
      {isActive && (
        <motion.span
          layoutId="sidebar-active-indicator"
          className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-blue-600 dark:bg-blue-400"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}

      <Icon
        className={cn(
          'h-5 w-5 shrink-0',
          isActive
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300',
        )}
      />

      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' as const }}
            className="flex-1 truncate"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {!collapsed && item.badge !== undefined && item.badge > 0 && (
        <Badge
          variant="destructive"
          className="ml-auto h-5 min-w-[20px] px-1.5 text-[10px]"
        >
          {item.badge > 99 ? '99+' : item.badge}
        </Badge>
      )}
    </div>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          <span>{item.label}</span>
          {item.badge !== undefined && item.badge > 0 && (
            <Badge
              variant="destructive"
              className="h-4 min-w-[18px] px-1 text-[10px]"
            >
              {item.badge > 99 ? '99+' : item.badge}
            </Badge>
          )}
        </TooltipContent>
      </Tooltip>
    )
  }

  return linkContent
}

// 
// Main Sidebar Component
// 

export function Sidebar() {
  const pathname = usePathname()

  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed)
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const toggleSidebarCollapsed = useUIStore((s) => s.toggleSidebarCollapsed)
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen)

  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  //  Filter nav sections by role 

  const filteredSections = useMemo(() => {
    if (!user) return []
    return NAV_SECTIONS.filter((section) => {
      if (!section.roles) return true
      return section.roles.includes(user.role)
    })
  }, [user])

  //  Active path check 

  const isActive = useCallback(
    (href: string) => {
      if (href === '/dashboard') {
        return pathname === '/dashboard' || pathname === '/'
      }
      return pathname.startsWith(href)
    },
    [pathname],
  )

  //  Render 

  const sidebarContent = (
    <aside
      className={cn(
        'flex h-full flex-col border-r transition-colors duration-300',
        'bg-white/80 backdrop-blur-xl dark:bg-gray-950/80',
        'border-gray-200/60 dark:border-gray-800/60',
      )}
    >
      {/*  Logo  */}
      <SidebarLogo collapsed={sidebarCollapsed} />

      {/*  Separator  */}
      <div className="mx-4 border-t border-gray-200/60 dark:border-gray-800/60" />

      {/*  Navigation  */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-6">
          {filteredSections.map((section) => (
            <div key={section.title}>
              {/* Section title */}
              <AnimatePresence mode="wait">
                {!sidebarCollapsed && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500"
                  >
                    {section.title}
                  </motion.p>
                )}
              </AnimatePresence>

              <ul className="flex flex-col gap-0.5">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="group block">
                      <NavItemComponent
                        item={item}
                        collapsed={sidebarCollapsed}
                        isActive={isActive(item.href)}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/*  CTA Button  */}
      <div
        className={cn(
          'border-t border-gray-200/60 px-3 py-3 dark:border-gray-800/60',
          sidebarCollapsed && 'px-2',
        )}
      >
        <Button
          size={sidebarCollapsed ? 'icon' : 'default'}
          className={cn(
            'w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600',
            sidebarCollapsed && 'h-10 w-10',
          )}
          asChild
        >
          <Link href="/expenses/new">
            <Plus className="h-5 w-5" />
            <AnimatePresence mode="wait">
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  Create Expense
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </Button>
      </div>

      {/*  User section  */}
      <div
        className={cn(
          'flex items-center gap-3 border-t border-gray-200/60 px-4 py-3 dark:border-gray-800/60',
          sidebarCollapsed && 'justify-center px-2',
        )}
      >
        <Avatar className="h-9 w-9 shrink-0 ring-2 ring-gray-200/50 dark:ring-gray-700/50">
          {user?.photoURL ? (
            <AvatarImage src={user.photoURL} alt={user.displayName} />
          ) : null}
          <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-xs font-semibold text-blue-700 dark:from-blue-900/50 dark:to-indigo-900/50 dark:text-blue-300">
            {user ? getInitials(user.displayName) : 'U'}
          </AvatarFallback>
        </Avatar>

        <AnimatePresence mode="wait">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-1 flex-col overflow-hidden"
            >
              <span className="truncate text-sm font-medium text-gray-900 dark:text-white">
                {user?.displayName ?? 'User'}
              </span>
              <span className="truncate text-xs text-gray-500 capitalize dark:text-gray-400">
                {user?.role?.replace(/_/g, ' ') ?? '—'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {!sidebarCollapsed && (
          <button
            type="button"
            onClick={logout}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>

      {/*  Collapse toggle (desktop)  */}
      <button
        type="button"
        onClick={toggleSidebarCollapsed}
        className={cn(
          'absolute -right-3 top-20 z-20 flex h-6 w-6 items-center justify-center rounded-full border bg-white text-gray-400 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-300',
          'hidden lg:flex',
        )}
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>
    </aside>
  )

  //  Desktop sidebar 

  const desktopSidebar = (
    <motion.aside
      initial={false}
      animate={{
        width: sidebarCollapsed ? 72 : 280,
      }}
      transition={{
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1] as const,
      }}
      className={cn(
        'relative hidden h-full shrink-0 overflow-hidden lg:block',
        sidebarCollapsed ? 'w-[72px]' : 'w-[280px]',
      )}
    >
      {sidebarContent}
    </motion.aside>
  )

  //  Mobile sidebar overlay 

  const mobileSidebar = (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 35,
            }}
            className="fixed inset-y-0 left-0 z-50 w-[280px] shadow-2xl lg:hidden"
          >
            {sidebarContent}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )

  return (
    <TooltipProvider delayDuration={300}>
      {desktopSidebar}
      {mobileSidebar}
    </TooltipProvider>
  )
}
