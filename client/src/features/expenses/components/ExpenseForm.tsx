'use client'

import { useState, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  DollarSign,
  Tag,
  Building2,
  User,
  FileText,
  X,
  Plus,
  Send,
  Save,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
} from 'lucide-react'

import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { CategorySelect } from '@/features/expenses/components/CategorySelect'
import { ReceiptUpload, type ReceiptFile } from '@/features/expenses/components/ReceiptUpload'
import { expenseSchema, type ExpenseFormData } from '@/utils/validation'
import { EXPENSE_CATEGORIES_MAP, CURRENCIES_MAP, DEFAULT_CURRENCY } from '@/constants'
import type { Expense } from '@/types'

// 
// Types
// 

export interface ExpenseFormProps {
  /** Existing expense for edit mode. */
  initialData?: Expense | null

  /** Called with validated form data when submitted. */
  onSubmit?: (data: ExpenseFormData & { receipt?: ReceiptFile | null }) => Promise<void>

  /** Called when the user cancels. */
  onCancel?: () => void

  /** 	rue while the submission is in flight. */
  isSubmitting?: boolean

  /** Optional file upload handler (called after file selection). */
  onReceiptUpload?: (file: File) => Promise<void>

  /** 	rue while OCR is processing. */
  isOcrProcessing?: boolean

  /** Known vendors for autocomplete. */
  vendors?: string[]

  className?: string
}

// 
// Constants
// 

const COMMON_VENDORS = [
  'Amazon',
  'Google',
  'Microsoft',
  'Uber',
  'Lyft',
  'Staples',
  'Office Depot',
  'Delta Airlines',
  'Marriott',
  'Hilton',
  'DoorDash',
  'Grubhub',
]

// 
// Component
// 

export function ExpenseForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  onReceiptUpload,
  isOcrProcessing = false,
  vendors: externalVendors,
  className,
}: ExpenseFormProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [receipt, setReceipt] = useState<ReceiptFile | null>(null)
  const [vendorSuggestions, setVendorSuggestions] = useState<string[]>([])

  const allVendors = [...new Set([...(externalVendors ?? []), ...COMMON_VENDORS])]

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: {
      title: initialData?.title ?? '',
      description: initialData?.description ?? '',
      amount: initialData?.amount ?? undefined,
      currency: initialData?.currency ?? DEFAULT_CURRENCY.code,
      category: initialData?.category ?? '',
      subCategory: initialData?.subCategory ?? '',
      date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      vendor: initialData?.vendor ?? '',
      project: initialData?.project ?? '',
      departmentId: initialData?.departmentId ?? '',
      tags: initialData?.tags ?? [],
      notes: initialData?.notes ?? '',
    },
  })

  const watchedValues = watch()
  const selectedCategory = watchedValues.category
  const categoryConfig = EXPENSE_CATEGORIES_MAP[selectedCategory]
  const subCategories = categoryConfig?.subCategories ?? []

  //  Tag management 

  const addTag = useCallback(() => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed) && tags.length < 20) {
      const newTags = [...tags, trimmed]
      setTags(newTags)
      setValue('tags', newTags)
      setTagInput('')
    }
  }, [tagInput, tags, setValue])

  const removeTag = useCallback(
    (tag: string) => {
      const newTags = tags.filter((t) => t !== tag)
      setTags(newTags)
      setValue('tags', newTags)
    },
    [tags, setValue],
  )

  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        addTag()
      }
      if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
        removeTag(tags[tags.length - 1])
      }
    },
    [addTag, removeTag, tagInput, tags],
  )

  //  Vendor autocomplete 

  const handleVendorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setValue('vendor', value)
      if (value.length > 0) {
        const filtered = allVendors.filter((v) =>
          v.toLowerCase().includes(value.toLowerCase()),
        )
        setVendorSuggestions(filtered.slice(0, 5))
      } else {
        setVendorSuggestions([])
      }
    },
    [setValue, allVendors],
  )

  //  Submit 

  const onFormSubmit = useCallback(
    async (data: ExpenseFormData) => {
      const payload = { ...data, receipt }
      await onSubmit?.(payload)
    },
    [onSubmit, receipt],
  )

  //  Preview data 

  const previewData = {
    title: watchedValues.title || 'Untitled',
    amount: watchedValues.amount || 0,
    currency: watchedValues.currency || 'USD',
    category: watchedValues.category,
    vendor: watchedValues.vendor,
    date: watchedValues.date,
    description: watchedValues.description,
  }

  return (
    <div className={cn('relative', className)}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <form onSubmit={handleSubmit(onFormSubmit as any)} className="space-y-6">
        {/*  Title & Description  */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="Title *"
              placeholder="Enter expense title"
              error={errors.title?.message}
              {...register('title')}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="description" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </Label>
            <textarea
              id="description"
              rows={2}
              placeholder="Optional description..."
              className={cn(
                'flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-blue-400',
                errors.description && 'border-red-500 focus:ring-red-500',
              )}
              {...register('description')}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/*  Amount & Currency  */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Input
              label="Amount *"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              icon={<DollarSign className="h-4 w-4" />}
              error={errors.amount?.message}
              {...register('amount', { valueAsNumber: true })}
            />
          </div>
          <div>
            <Label htmlFor="currency" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Currency
            </Label>
            <select
              id="currency"
              className={cn(
                'flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100',
              )}
              {...register('currency')}
            >
              {Object.values(CURRENCIES_MAP).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/*  Category  */}
        <div>
          <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category *
          </Label>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <CategorySelect
                value={field.value}
                onChange={field.onChange}
                error={errors.category?.message}
              />
            )}
          />
        </div>

        {/*  Sub Category  */}
        {subCategories.length > 0 && (
          <div>
            <Label htmlFor="subCategory" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Sub-Category
            </Label>
            <select
              id="subCategory"
              className={cn(
                'flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100',
              )}
              {...register('subCategory')}
            >
              <option value="">Select sub-category</option>
              {subCategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        )}

        {/*  Vendor & Project  */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="relative">
            <Input
              label="Vendor"
              placeholder="e.g. Amazon, Uber..."
              icon={<User className="h-4 w-4" />}
              error={errors.vendor?.message}
              {...register('vendor')}
              onChange={handleVendorChange}
            />
            {vendorSuggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                {vendorSuggestions.map((v) => (
                  <button
                    key={v}
                    type="button"
                    className="w-full rounded-md px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    onClick={() => {
                      setValue('vendor', v)
                      setVendorSuggestions([])
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Input
            label="Project"
            placeholder="Optional project name"
            icon={<Building2 className="h-4 w-4" />}
            error={errors.project?.message}
            {...register('project')}
          />
        </div>

        {/*  Date  */}
        <div className="sm:w-1/2">
          <Input
            label="Date *"
            type="date"
            icon={<Calendar className="h-4 w-4" />}
            error={errors.date?.message}
            {...register('date')}
          />
        </div>

        {/*  Tags  */}
        <div>
          <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tags
          </Label>
          <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-blue-900 dark:hover:text-blue-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder={tags.length === 0 ? 'Add tags...' : ''}
              className="min-w-[100px] flex-1 border-0 bg-transparent p-0 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 dark:text-gray-100 dark:placeholder:text-gray-500"
            />
            {tagInput && (
              <button
                type="button"
                onClick={addTag}
                className="rounded p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
          </div>
          {errors.tags && (
            <p className="mt-1 text-xs text-red-500">{errors.tags.message}</p>
          )}
        </div>

        {/*  Notes  */}
        <div>
          <Label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Notes
          </Label>
          <textarea
            id="notes"
            rows={3}
            placeholder="Additional notes..."
            className={cn(
              'flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500',
              errors.notes && 'border-red-500',
            )}
            {...register('notes')}
          />
        </div>

        {/*  Receipt Upload  */}
        <div>
          <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Receipt
          </Label>
          <ReceiptUpload
            value={receipt}
            onChange={setReceipt}
            onUpload={onReceiptUpload}
            isUploading={isSubmitting}
            isOcrProcessing={isOcrProcessing}
          />
        </div>

        {/*  Preview  */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
            >
              <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Preview
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Title</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {previewData.title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: previewData.currency,
                    }).format(previewData.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Category</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {categoryConfig?.icon} {(categoryConfig?.label ?? previewData.category) || 'Not set'}
                  </span>
                </div>
                {previewData.vendor && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Vendor</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {previewData.vendor}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {String(previewData.date || 'Not set')}
                  </span>
                </div>
                {previewData.description && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Description</span>
                    <span className="max-w-[200px] truncate font-medium text-gray-900 dark:text-gray-100">
                      {previewData.description}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/*  Actions  */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? (
              <>
                <EyeOff className="mr-1 h-4 w-4" /> Hide Preview
              </>
            ) : (
              <>
                <Eye className="mr-1 h-4 w-4" /> Show Preview
              </>
            )}
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Send className="mr-1 h-4 w-4" />
                  {initialData ? 'Update Expense' : 'Create Expense'}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
