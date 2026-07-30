import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { APP_NAME, APP_DESCRIPTION } from '@/constants'

export const metadata: Metadata = {
  title: {
    template: `%s | ${APP_NAME}`,
    default: `Legal & Policies | ${APP_NAME}`,
  },
  description: `Legal policies, terms of service, and compliance information for ${APP_NAME} Enterprise.`,
}

const legalLinks = [
  { href: '/terms', label: 'Terms of Service' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/cookies', label: 'Cookie Policy' },
  { href: '/security', label: 'Security' },
  { href: '/acceptable-use', label: 'Acceptable Use' },
  { href: '/ai-policy', label: 'AI Policy' },
  { href: '/refund', label: 'Refund Policy' },
  { href: '/dpa', label: 'DPA' },
  { href: '/accessibility', label: 'Accessibility' },
  { href: '/disclaimer', label: 'Disclaimer' },
]

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      {/* Animated background blobs */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full opacity-20 blur-3xl"
          style={{
            background:
              'radial-gradient(circle at center, #6366F1 0%, transparent 70%)',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full opacity-15 blur-3xl"
          style={{
            background:
              'radial-gradient(circle at center, #06B6D4 0%, transparent 70%)',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute left-1/3 top-1/3 h-[400px] w-[400px] -translate-y-1/2 rounded-full opacity-10 blur-3xl"
          style={{
            background:
              'radial-gradient(circle at center, #8B5CF6 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/70 backdrop-blur-xl dark:border-gray-800/60 dark:bg-gray-950/70">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-3 transition-opacity hover:opacity-80">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
              <span className="text-sm font-bold text-white">F</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-gray-900 dark:text-white">
                {APP_NAME}
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                {APP_DESCRIPTION}
              </span>
            </div>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Sidebar navigation */}
      <div className="mx-auto flex max-w-5xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <nav
          aria-label="Legal pages navigation"
          className="hidden w-48 shrink-0 lg:block"
        >
          <ul className="sticky top-24 space-y-1">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-md px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200/60 bg-white/50 dark:border-gray-800/60 dark:bg-gray-950/50">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600">
                <span className="text-xs font-bold text-white">F</span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {APP_NAME}
              </span>
            </Link>
            <p className="max-w-md text-xs text-gray-500 dark:text-gray-400">
              {APP_NAME} Enterprise is an AI-powered expense management platform.
              This page contains our legal policies and compliance information.
            </p>
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-gray-400 dark:text-gray-500">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}