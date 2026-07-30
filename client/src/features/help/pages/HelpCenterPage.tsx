'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import {
  Search,
  Sparkles,
  CreditCard,
  CheckCircle2,
  Brain,
  BarChart3,
  Settings,
  Shield,
  HelpCircle,
  MessageCircle,
  Bug,
  Lightbulb,
  ChevronRight,
  ArrowUpRight,
  ExternalLink,
  Mail,
  Activity,
  BookOpen,
} from 'lucide-react'

import { APP_NAME } from '@/constants'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HelpCategoryCard, type HelpCategoryCardProps } from '@/features/help/components/HelpCategoryCard'
import { FaqSection } from '@/features/help/components/FaqSection'

// ──────────────────────────────────────────────
// Data
// ──────────────────────────────────────────────

const CATEGORIES: HelpCategoryCardProps[] = [
  {
    icon: Sparkles,
    title: 'Getting Started',
    description: 'Learn the basics of setting up your account, inviting your team, and submitting your first expense.',
    articleCount: 8,
    gradient: 'from-blue-600 to-indigo-600',
    href: '#getting-started',
  },
  {
    icon: CreditCard,
    title: 'Managing Expenses',
    description: 'Submit, edit, and track expenses. Learn about receipt scanning, categories, and reimbursement.',
    articleCount: 12,
    gradient: 'from-emerald-600 to-teal-600',
    href: '#managing-expenses',
  },
  {
    icon: CheckCircle2,
    title: 'Approvals',
    description: 'Understand multi-level approval workflows, delegation, and real-time status tracking.',
    articleCount: 6,
    gradient: 'from-violet-600 to-purple-600',
    href: '#approvals',
  },
  {
    icon: Brain,
    title: 'AI Features',
    description: 'Explore AI-powered categorization, anomaly detection, health scoring, and the AI assistant.',
    articleCount: 9,
    gradient: 'from-pink-600 to-rose-600',
    href: '#ai-features',
  },
  {
    icon: BarChart3,
    title: 'Reports & Analytics',
    description: 'Generate custom reports, analyze spending trends, and forecast budgets with AI insights.',
    articleCount: 7,
    gradient: 'from-amber-500 to-orange-600',
    href: '#reports',
  },
  {
    icon: Settings,
    title: 'Account Settings',
    description: 'Manage your profile, preferences, notifications, and security settings.',
    articleCount: 5,
    gradient: 'from-cyan-600 to-blue-600',
    href: '#account-settings',
  },
  {
    icon: Shield,
    title: 'Billing & Plans',
    description: 'Information about pricing tiers, invoices, payment methods, and plan upgrades.',
    articleCount: 4,
    gradient: 'from-indigo-600 to-blue-600',
    href: '#billing',
  },
  {
    icon: Activity,
    title: 'Security & Compliance',
    description: 'Learn about data encryption, access controls, audit logs, and compliance certifications.',
    articleCount: 6,
    gradient: 'from-red-600 to-rose-600',
    href: '#security',
  },
]

const QUICK_LINKS = [
  { icon: BookOpen, label: 'API Documentation', href: '#' },
  { icon: MessageCircle, label: 'Community Forum', href: '#' },
  { icon: ExternalLink, label: 'Video Tutorials', href: '#' },
  { icon: Mail, label: 'Contact Support', href: 'mailto:support@finflow.ai' },
]

// ──────────────────────────────────────────────
// Animation variants
// ──────────────────────────────────────────────

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

// ──────────────────────────────────────────────
// Section wrapper
// ──────────────────────────────────────────────

function Section({
  children,
  className,
  id,
}: {
  children: React.ReactNode
  className?: string
  id?: string
}) {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.section>
  )
}

// ──────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────

function SystemStatus() {
  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-emerald-200/60 bg-emerald-50/80 px-4 py-2 text-xs font-medium backdrop-blur-sm dark:border-emerald-800/50 dark:bg-emerald-950/40">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <span className="text-emerald-700 dark:text-emerald-300">All systems operational</span>
    </div>
  )
}

// ──────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────

export function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      {/* Animated background blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-blue-400/10 blur-3xl dark:bg-blue-500/10" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-500/10" />
        <div className="absolute left-1/4 top-1/3 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-violet-400/5 blur-3xl dark:bg-violet-500/5" />
      </div>

      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden border-b border-gray-200/60 bg-white/50 backdrop-blur-xl dark:border-gray-800/60 dark:bg-gray-950/50">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* System status */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-6 flex items-center justify-center"
            >
              <SystemStatus />
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl"
            >
              How can we{' '}
              <span className="gradient-text">help you</span>?
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mx-auto mt-4 max-w-2xl text-lg text-gray-500 dark:text-gray-400"
            >
              Search our knowledge base, browse categories, or get in touch
              with our support team.
            </motion.p>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mx-auto mt-8 max-w-xl"
            >
              <div className="group relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles, topics, or questions..."
                  className="h-14 w-full rounded-2xl border border-gray-200/80 bg-white/80 pl-12 pr-4 text-sm text-gray-900 shadow-lg shadow-blue-500/5 backdrop-blur-sm placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700/80 dark:bg-gray-800/80 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-400/10"
                  aria-label="Search help articles"
                />
                <kbd className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-lg border border-gray-200 bg-white/80 px-2 py-1 font-mono text-[10px] font-medium text-gray-400 backdrop-blur-sm sm:inline-flex dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-500">
                  <span>⌘</span>K
                </kbd>
              </div>
            </motion.div>

            {/* Quick links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-3"
            >
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200/60 bg-white/60 px-4 py-1.5 text-xs font-medium text-gray-600 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-gray-300/80 hover:bg-white hover:text-gray-900 dark:border-gray-700/60 dark:bg-gray-800/60 dark:text-gray-400 dark:hover:border-gray-600/80 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  <link.icon className="h-3.5 w-3.5" />
                  {link.label}
                </Link>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-gray-50/80 to-transparent dark:from-gray-950/80" />
      </section>

      {/* ─── Categories Section ─── */}
      <Section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeInUp} className="text-center">
            <Badge variant="secondary" className="mb-4">
              <BookOpen className="mr-1.5 h-3.5 w-3.5" />
              Browse by Category
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              Find the answers you need
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {CATEGORIES.length} categories with{' '}
              {CATEGORIES.reduce((acc, c) => acc + c.articleCount, 0)} articles
            </p>
          </motion.div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {CATEGORIES.map((category, i) => (
              <HelpCategoryCard key={category.title} {...category} index={i} />
            ))}
          </div>
        </div>
      </Section>

      {/* ─── FAQ Section ─── */}
      <Section className="border-t border-gray-200/60 bg-white/50 py-16 backdrop-blur-sm dark:border-gray-800/60 dark:bg-gray-900/30 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeInUp} id="faq" className="text-center">
            <Badge variant="secondary" className="mb-4">
              <HelpCircle className="mr-1.5 h-3.5 w-3.5" />
              FAQ
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              Frequently asked questions
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Everything you need to know about using {APP_NAME} Enterprise
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="mt-8">
            <FaqSection searchQuery={searchQuery} />
          </motion.div>
        </div>
      </Section>

      {/* ─── Contact & Support Section ─── */}
      <Section className="border-t border-gray-200/60 bg-white/30 py-16 backdrop-blur-sm dark:border-gray-800/60 dark:bg-gray-950/20 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeInUp} className="text-center">
            <Badge variant="secondary" className="mb-4">
              <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
              Get in Touch
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              Still need help?
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Our team is here to support you
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {/* Contact Support */}
            <motion.div
              variants={fadeInUp}
              className="group relative overflow-hidden rounded-2xl border border-gray-200/60 bg-white/70 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700/60 dark:bg-gray-900/70"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-1.5 text-base font-semibold text-gray-900 dark:text-white">
                Contact Support
              </h3>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                Get help from our support team. We typically respond within 24 hours.
              </p>
              <Link
                href="mailto:support@finflow.ai"
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                support@finflow.ai
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/30 via-transparent to-indigo-50/30 dark:from-blue-950/10 dark:to-indigo-950/10" />
              </div>
            </motion.div>

            {/* Bug Report */}
            <motion.div
              variants={fadeInUp}
              id="bug-report"
              className="group relative overflow-hidden rounded-2xl border border-gray-200/60 bg-white/70 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700/60 dark:bg-gray-900/70"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                <Bug className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-1.5 text-base font-semibold text-gray-900 dark:text-white">
                Bug Report
              </h3>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                Found a bug? Let us know and we&apos;ll fix it promptly.
              </p>
              <Link
                href="mailto:bugs@finflow.ai"
                className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 transition-colors hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
              >
                bugs@finflow.ai
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-50/30 via-transparent to-orange-50/30 dark:from-amber-950/10 dark:to-orange-950/10" />
              </div>
            </motion.div>

            {/* Feature Request */}
            <motion.div
              variants={fadeInUp}
              id="feature-request"
              className="group relative overflow-hidden rounded-2xl border border-gray-200/60 bg-white/70 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700/60 dark:bg-gray-900/70"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 shadow-lg">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-1.5 text-base font-semibold text-gray-900 dark:text-white">
                Feature Request
              </h3>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                Have an idea? We&apos;d love to hear your suggestions.
              </p>
              <Link
                href="mailto:feedback@finflow.ai"
                className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                feedback@finflow.ai
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-50/30 via-transparent to-teal-50/30 dark:from-emerald-950/10 dark:to-teal-950/10" />
              </div>
            </motion.div>

            {/* Live Chat */}
            <motion.div
              variants={fadeInUp}
              className="group relative overflow-hidden rounded-2xl border border-gray-200/60 bg-white/70 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700/60 dark:bg-gray-900/70"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-1.5 text-base font-semibold text-gray-900 dark:text-white">
                Live Chat
              </h3>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                Chat with our team in real-time during business hours.
              </p>
              <Button size="sm" variant="outline" className="gap-1.5">
                Start Chat
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
              <p className="mt-2 text-[10px] text-gray-400 dark:text-gray-500">
                Mon-Fri, 9AM-6PM EST
              </p>
              <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-50/30 via-transparent to-purple-50/30 dark:from-violet-950/10 dark:to-purple-950/10" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </Section>

      {/* ─── CTA Section ─── */}
      <Section className="border-t border-gray-200/60 py-16 dark:border-gray-800/60 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeInUp}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 px-6 py-14 text-center shadow-2xl shadow-blue-500/25 sm:px-16 sm:py-20"
          >
            {/* Decorative blobs */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
              <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute left-1/3 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-white/5 blur-2xl" />
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Can&apos;t find what you&apos;re looking for?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-blue-100">
              Our support team is ready to help you with any questions or issues.
              We typically respond within a few hours.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="mailto:support@finflow.ai">
                <Button
                  size="lg"
                  className="h-12 gap-2 bg-white px-8 text-base font-semibold text-blue-700 shadow-xl hover:bg-blue-50"
                >
                  <Mail className="h-4 w-4" />
                  Email Support
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 gap-2 border-white/30 bg-white/10 px-8 text-base font-medium text-white shadow-lg backdrop-blur-sm hover:bg-white/20"
                >
                  Back to Dashboard
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </Section>
    </div>
  )
}