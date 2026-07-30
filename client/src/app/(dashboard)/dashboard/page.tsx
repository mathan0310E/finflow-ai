'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardIndex() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || !user) {
      router.replace('/login')
      return
    }

    // Route based on role
    switch (user.role) {
      case 'ceo':
        router.replace('/dashboard/ceo')
        break
      case 'finance_manager':
        router.replace('/dashboard/finance')
        break
      case 'dept_manager':
        router.replace('/dashboard/manager')
        break
      case 'employee':
        router.replace('/dashboard/employee')
        break
      default:
        router.replace('/dashboard/employee')
    }
  }, [isLoading, isAuthenticated, user, router])

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}
