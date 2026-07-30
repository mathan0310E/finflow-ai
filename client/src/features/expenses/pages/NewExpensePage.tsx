'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, Camera } from 'lucide-react'

import { PageHeader } from '@/components/layout/PageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ExpenseForm } from '@/features/expenses/components/ExpenseForm'
import { ReceiptUpload, type ReceiptFile } from '@/features/expenses/components/ReceiptUpload'
import { useCreateExpense } from '@/features/expenses/hooks/useExpenses'
import type { ExpenseFormData } from '@/utils/validation'

// Page Variants

const pageVariants = {
  hidden: { opacity: 0, y: 12 } as const,
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
  } as const,
}

// Page Component

export default function NewExpensePage() {
  const router = useRouter()
  const createExpense = useCreateExpense()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [receipt, setReceipt] = useState<ReceiptFile | null>(null)
  const [activeTab, setActiveTab] = useState('manual')

  //  Submit handler 

  const handleSubmit = useCallback(
    async (data: ExpenseFormData & { receipt?: ReceiptFile | null }) => {
      setIsSubmitting(true)
      try {
        await createExpense.mutateAsync({
          title: data.title,
          description: data.description || undefined,
          amount: data.amount,
          currency: data.currency,
          category: data.category,
          subCategory: data.subCategory || undefined,
          date: new Date(data.date),
          vendor: data.vendor || undefined,
          project: data.project || undefined,
          departmentId: data.departmentId || undefined,
          tags: data.tags,
          notes: data.notes || undefined,
        })

        router.push('/expenses')
      } catch {
        // Error handled by the mutation / store
      } finally {
        setIsSubmitting(false)
      }
    },
    [createExpense, router],
  )

  //  OCR scan placeholder 

  const handleReceiptForOcr = useCallback(async (_file: File) => {
    // In a real app, this would upload the receipt and trigger OCR
    // then auto-fill the form with extracted data
    // Simulated async operation
    await Promise.resolve()
  }, [])

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/*  Header  */}
      <PageHeader
        title="New Expense"
        description="Create a new expense claim"
        backHref="/expenses"
      />

      {/*  Tab: Manual Entry / OCR Scan  */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Manual Entry
          </TabsTrigger>
          <TabsTrigger value="ocr" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Scan Receipt
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/80 sm:p-8">
              <ExpenseForm
                onSubmit={handleSubmit}
                onCancel={() => router.back()}
                isSubmitting={isSubmitting}
                onReceiptUpload={handleReceiptForOcr}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ocr">
          <div className="mx-auto max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/80 sm:p-8"
            >
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/40">
                  <Camera className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Scan a Receipt
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Upload a receipt photo and we&apos;ll auto-fill the expense details using AI
                </p>
              </div>

              <ReceiptUpload
                value={receipt}
                onChange={setReceipt}
                onUpload={handleReceiptForOcr}
              />

              {receipt && (
                <div className="mt-6">
                  <Button
                    className="w-full"
                    onClick={() => {
                      // In a real app: trigger OCR, then switch to manual tab with filled data
                      setActiveTab('manual')
                    }}
                  >
                    <Sparkles className="mr-1 h-4 w-4" />
                    Extract with AI
                  </Button>
                  <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
                    AI will extract amount, date, vendor, and category from the receipt
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
