'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Check } from 'lucide-react'

import { cn } from '@/lib/cn'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { EXPENSE_CATEGORIES } from '@/constants'

// 
// Types
// 

export interface CategorySelectProps {
  value?: string
  onChange?: (category: string) => void
  recentlyUsed?: string[]
  error?: string
  className?: string
}

// 
// Component
// 

export function CategorySelect({
  value,
  onChange,
  recentlyUsed = [],
  error,
  className,
}: CategorySelectProps) {
  const [search, setSearch] = useState('')

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return EXPENSE_CATEGORIES
    const q = search.toLowerCase()
    return EXPENSE_CATEGORIES.filter(
      (c) =>
        c.label.toLowerCase().includes(q) || c.value.toLowerCase().includes(q),
    )
  }, [search])

  const recentlyUsedCategories = useMemo(
    () => EXPENSE_CATEGORIES.filter((c) => recentlyUsed.includes(c.value)),
    [recentlyUsed],
  )

  return (
    <div className={cn('w-full', className)}>
      {/*  Search  */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
        />
      </div>

      {/*  Recently used  */}
      {recentlyUsedCategories.length > 0 && !search && (
        <div className="mb-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Recently Used
          </p>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {recentlyUsedCategories.map((cat) => (
              <motion.button
                key={cat.value}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onChange?.(cat.value)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl border p-3 transition-all duration-200',
                  value === cat.value
                    ? 'border-blue-300 bg-blue-50 text-blue-700 shadow-sm dark:border-blue-600 dark:bg-blue-950/40 dark:text-blue-300'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-750',
                )}
              >
                <span className="text-xl">{cat.icon}</span>
                <span className="text-[10px] font-medium leading-tight">
                  {cat.label}
                </span>
                {value === cat.value && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-white"
                  >
                    <Check className="h-3 w-3" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
          <div className="my-3 border-t border-gray-100 dark:border-gray-700" />
        </div>
      )}

      {/*  Category grid  */}
      <ScrollArea className="h-[280px] -mr-1 pr-1">
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {filteredCategories.map((cat) => (
            <motion.button
              key={cat.value}
              type="button"
              layout
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange?.(cat.value)}
              className={cn(
                'relative flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all duration-200',
                value === cat.value
                  ? 'border-blue-300 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-300 dark:border-blue-600 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-500/50'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-750',
              )}
            >
              <span className="text-xl">{cat.icon}</span>
              <span className="text-[10px] font-medium leading-tight text-center">
                {cat.label}
              </span>
              {cat.subCategories && cat.subCategories.length > 0 && (
                <span className="text-[8px] text-gray-400 dark:text-gray-500">
                  {cat.subCategories.length} sub
                </span>
              )}
              {value === cat.value && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white shadow-sm"
                >
                  <Check className="h-3 w-3" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No categories found
            </p>
            <button
              type="button"
              onClick={() => onChange?.('custom')}
              className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              <Plus className="h-3.5 w-3.5" />
              Add custom category
            </button>
          </div>
        )}
      </ScrollArea>

      {error && (
        <p className="mt-1.5 text-xs text-red-500 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
