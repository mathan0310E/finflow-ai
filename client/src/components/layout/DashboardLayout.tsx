'use client'

import { type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

import { cn } from '@/lib/cn'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

// 
// Page transition variants
// 

const pageVariants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
}

// 
// Props
// 

export interface DashboardLayoutProps {
  /** Main page content (React children or Next.js parallel routes). */
  children: ReactNode

  /** Optional class name for the main content wrapper. */
  className?: string
}

// 
// Component
// 

/**
 * The main authenticated layout for the FinFlow AI dashboard.
 *
 * Composes the animated `Sidebar`, the floating `Header`, and a scrollable
 * main content area. The content area uses `AnimatePresence` with a `key`
 * derived from the current pathname, enabling smooth page transitions.
 *
 * **Responsive behaviour:**
 * - Desktop: persistent sidebar (collapsible icon/text) + header + content
 * - Mobile: sidebar becomes a slide-in overlay triggered by the header menu
 *
 * @example
 * ```tsx
 * // app/(dashboard)/layout.tsx
 * import { DashboardLayout } from '@/components/layout/DashboardLayout'
 *
 * export default function Layout({ children }: { children: React.ReactNode }) {
 *   return <DashboardLayout>{children}</DashboardLayout>
 * }
 * ```
 */
export function DashboardLayout({
  children,
  className,
}: DashboardLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/*  Sidebar  */}
      <Sidebar />

      {/*  Main area  */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />

        <main
          className={cn(
            'flex-1 overflow-y-auto',
            className,
          )}
        >
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}

// 
