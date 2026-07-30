'use client'

import { Suspense } from 'react'
import RegisterPage from '@/features/auth/pages/RegisterPage'

function JoinRegisterInner() {
  return <RegisterPage defaultMode="join" />
}

export default function JoinRegisterRoute() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="h-96 w-96 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" /></div>}>
      <JoinRegisterInner />
    </Suspense>
  )
}
