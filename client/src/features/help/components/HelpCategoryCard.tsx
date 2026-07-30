'use client'

import { type ElementType } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

import { cn } from '@/lib/cn'

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface HelpCategoryCardProps {
  icon: ElementType
  title: string
  description: string
  articleCount: number
  gradient: string
  href?: string
  index?: number
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export function HelpCategoryCard({
  icon: Icon,
  title,
  description,
  articleCount,
  gradient,
  href = '#',
  index = 0,
}: HelpCategoryCardProps) {
  return (
    <motion.a
      href={href}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] as const }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="group relative overflow-hidden rounded-2xl border border-gray-200/60 bg-white/70 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-gray-300/80 hover:shadow-lg hover:shadow-blue-500/5 dark:border-gray-700/60 dark:bg-gray-900/70 dark:hover:border-gray-600/80 dark:hover:shadow-blue-500/10"
    >
      {/* Gradient icon container */}
      <div
        className={cn(
          'mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg shadow-blue-500/10 ring-1 ring-white/20',
          gradient,
        )}
      >
        <Icon className="h-6 w-6 text-white" />
      </div>

      {/* Content */}
      <h3 className="mb-1.5 text-base font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="mb-4 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
        {description}
      </p>

      {/* Article count + arrow */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
          {articleCount} {articleCount === 1 ? 'article' : 'articles'}
        </span>
        <ChevronRight className="h-4 w-4 text-gray-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-blue-500 dark:text-gray-600 dark:group-hover:text-blue-400" />
      </div>

      {/* Hover gradient overlay */}
      <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/30 via-transparent to-indigo-50/30 dark:from-blue-950/10 dark:to-indigo-950/10" />
      </div>
    </motion.a>
  )
}