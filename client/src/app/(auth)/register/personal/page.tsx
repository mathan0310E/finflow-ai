'use client'

import { Suspense } from 'react'
import RegisterPage from '@/features/auth/pages/RegisterPage'

function PersonalRegisterInner() {
  return <RegisterPage defaultMode="personal" />
}

export default function PersonalRegisterRoute() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="h-96 w-96 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" /></div>}>
      <PersonalRegisterInner />
    </Suspense>
  )
}
