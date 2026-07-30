'use client'

import { Suspense } from 'react'
import LoginPage from '@/features/auth/pages/LoginPage'
import { Skeleton } from '@/components/ui/skeleton'

function LoginRouteInner() {
  return <LoginPage />
}

export default function LoginRoute() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Skeleton className="h-96 w-96" /></div>}>
      <LoginRouteInner />
    </Suspense>
  )
}
