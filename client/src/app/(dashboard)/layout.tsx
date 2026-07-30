'use client'

import { AuthGuard } from '@/features/auth/components/AuthGuard'
import { DashboardLayout as AppDashboardLayout } from '@/components/layout/DashboardLayout'

export default function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <AppDashboardLayout>{children}</AppDashboardLayout>
    </AuthGuard>
  )
}
