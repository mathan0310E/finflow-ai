'use client'

import { use } from 'react'
import ExpenseDetailPage from '@/features/expenses/pages/ExpenseDetailPage'

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <ExpenseDetailPage expenseId={id} />
}
