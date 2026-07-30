'use client'

import { use } from 'react'
import { ApprovalDetailPage } from '@/features/approvals/pages/ApprovalDetailPage'

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <ApprovalDetailPage approvalId={id} />
}
