import type { Metadata } from 'next'
import { HelpCenterPage } from '@/features/help/pages/HelpCenterPage'
import { APP_NAME } from '@/constants'

export const metadata: Metadata = {
  title: `Help Center | ${APP_NAME} Enterprise`,
  description: `Find answers, browse articles, and get support for ${APP_NAME} Enterprise. Search our knowledge base or contact our support team.`,
}

export default function HelpRoute() {
  return <HelpCenterPage />
}