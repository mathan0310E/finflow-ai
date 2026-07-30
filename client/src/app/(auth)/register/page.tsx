'use client'

import { Suspense } from 'react'
import RegisterPage from '@/features/auth/pages/RegisterPage'
import { Skeleton } from '@/components/ui/skeleton'

function RegisterRouteInner() {
  return <RegisterPage />
}

export default function RegisterRoute() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Skeleton className="h-96 w-96" /></div>}>
      <RegisterRouteInner />
    </Suspense>
  )
}
