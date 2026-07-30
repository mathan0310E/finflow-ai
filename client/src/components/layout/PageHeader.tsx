'use client'

import { type ReactNode } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/button'

// 
// Props
// 

export interface PageHeaderProps {
  /** Page title. */
  title: string

  /** Optional description / subtitle shown below the title. */
  description?: string

  /** Optional back-button href. When provided, a back arrow is rendered. */
  backHref?: string

  /** Optional callback for the back button (overrides `backHref`). */
  onBack?: () => void

  /** Optional action buttons rendered on the right side. */
  children?: ReactNode

  /** Optional class name for the root element. */
  className?: string
}

// 
// Animation variants
// 

const headerVariants = {
  hidden: { opacity: 0, y: -12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
}

const descriptionVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      delay: 0.08,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
}

// 
// Component
// 

/**
 * Reusable page header with animated entrance, optional back button,
 * subtitle, and action buttons.
 *
 * @example
 * ```tsx
 * <PageHeader
 *   title="Expenses"
 *   description="Manage and track all expense claims"
 *   backHref="/dashboard"
 * >
 *   <Button variant="default">Create Expense</Button>
 * </PageHeader>
 * ```
 */
export function PageHeader({
  title,
  description,
  backHref,
  onBack,
  children,
  className,
}: PageHeaderProps) {
  const showBack = Boolean(backHref || onBack)

  return (
    <div
      className={cn(
        'flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6',
        className,
      )}
    >
      {/*  Left: title + meta  */}
      <div className="min-w-0 flex-1">
        <motion.div
          variants={headerVariants}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-3"
        >
          {/* Back button */}
          {showBack && (
            <>
              {backHref ? (
                <Button variant="ghost" size="icon" className="-ml-2 shrink-0" asChild>
                  <Link href={backHref} aria-label="Go back">
                    <ArrowLeft className="h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="-ml-2 shrink-0"
                  onClick={onBack}
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
            </>
          )}

          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              {title}
            </h1>
          </div>
        </motion.div>

        {description && (
          <motion.p
            variants={descriptionVariants}
            initial="hidden"
            animate="visible"
            className="mt-1 truncate text-sm text-gray-500 dark:text-gray-400"
          >
            {description}
          </motion.p>
        )}
      </div>

      {/*  Right: action buttons  */}
      {children && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.3,
            delay: 0.12,
            ease: [0.25, 0.1, 0.25, 1] as const,
          }}
          className="flex shrink-0 flex-wrap items-center gap-3"
        >
          {children}
        </motion.div>
      )}
    </div>
  )
}
