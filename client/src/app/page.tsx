'use client'

import { useRef, type ElementType } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import {
  Sparkles,
  Receipt,
  Brain,
  GitBranch,
  BarChart3,
  ChevronRight,
  CheckCircle2,
  Star,
  ArrowUpRight,
  Menu,
  Bot,
  Scan,
  TrendingUp,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/layout'
import { cn } from '@/lib/cn'
import { APP_NAME, APP_DESCRIPTION, COMPANY_TIERS } from '@/constants'

// 
// Types
// 

interface FeatureCard {
  icon: ElementType
  title: string
  description: string
  gradient: string
}

interface Step {
  step: string
  title: string
  description: string
  icon: ElementType
}

interface Testimonial {
  quote: string
  author: string
  role: string
  company: string
  rating: number
}

// 
// Data
// 

const FEATURES: FeatureCard[] = [
  {
    icon: Scan,
    title: 'Smart Receipt Scanning',
    description:
      'AI-powered OCR extracts data from receipts instantly. Support for 50+ languages and multiple currencies with 99% accuracy.',
    gradient: 'from-blue-600 to-indigo-600',
  },
  {
    icon: Brain,
    title: 'AI Categorization',
    description:
      'Machine learning models automatically categorize expenses, detect anomalies, and flag policy violations before submission.',
    gradient: 'from-violet-600 to-purple-600',
  },
  {
    icon: GitBranch,
    title: 'Approval Workflows',
    description:
      'Custom multi-level approval chains that match your org structure. Smart routing, delegation, and real-time status tracking.',
    gradient: 'from-emerald-600 to-teal-600',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description:
      'Live dashboards with AI-powered insights. Track spending patterns, forecast budgets, and identify cost-saving opportunities.',
    gradient: 'from-amber-500 to-orange-600',
  },
]

const HOW_IT_WORKS: Step[] = [
  {
    step: '01',
    title: 'Capture & Upload',
    description:
      'Snap a photo of any receipt or invoice. Our AI instantly extracts merchant, amount, date, and line items with incredible accuracy.',
    icon: Scan,
  },
  {
    step: '02',
    title: 'Auto-Classification',
    description:
      'Expenses are automatically categorized and routed through the correct approval chain. Policy checks happen in real-time.',
    icon: Bot,
  },
  {
    step: '03',
    title: 'Approve & Analyze',
    description:
      'Approve with one click from any device. Get powerful analytics and AI-driven insights to optimize your company spending.',
    icon: TrendingUp,
  },
]

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'FinFlow AI cut our expense reporting time by 80%. The AI categorization is so accurate we rarely need to make manual adjustments. It\'s become an indispensable part of our finance stack.',
    author: 'Sarah Chen',
    role: 'CFO',
    company: 'TechNova Inc.',
    rating: 5,
  },
  {
    quote:
      'The approval workflow automation alone saved us thousands of hours. Our team can now submit expenses on the go and get reimbursed in days, not weeks.',
    author: 'Marcus Rodriguez',
    role: 'VP of Finance',
    company: 'CloudScale Dynamics',
    rating: 5,
  },
  {
    quote:
      'We evaluated every expense management solution on the market. FinFlow AI\'s analytics and AI capabilities were miles ahead. The ROI was immediate and substantial.',
    author: 'Emily Watson',
    role: 'CEO',
    company: 'NexGen Solutions',
    rating: 5,
  },
]

// 
// Reusable animation variants
// 

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
}

// 
// Section wrapper with scroll animation
// 

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
  const isInView = useInView(ref, { once: true, margin: '-100px' })

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

// 
// Star Rating Component
// 

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'h-4 w-4',
            i < rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700',
          )}
        />
      ))}
    </div>
  )
}

// 
// Animated Counter
// 

function AnimatedCounter({ value, suffix = '' }: { value: string; suffix?: string }) {
  return (
    <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
      {value}{suffix}
    </span>
  )
}

// 
// Navbar
// 

function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' as const }}
      className="fixed inset-x-0 top-0 z-50 border-b border-gray-200/60 bg-white/80 backdrop-blur-xl dark:border-gray-800/60 dark:bg-gray-950/80"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 shadow-lg shadow-blue-500/20">
            <span className="text-sm font-bold text-white">F</span>
          </div>
          <span className="text-base font-semibold tracking-tight text-gray-900 dark:text-white">
            {APP_NAME}
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {[
            { label: 'Features', href: '#features' },
            { label: 'How It Works', href: '#how-it-works' },
            { label: 'Pricing', href: '#pricing' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white sm:block"
          >
            Sign In
          </Link>
          <Link href="/register">
            <Button size="sm" className="gap-1.5">
              Get Started
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.nav>
  )
}

// 
// Hero Section
// 

function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-24">
      {/* Animated gradient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950" />
        <motion.div
          animate={{ x: [0, 60, -40, 0], y: [0, -60, 40, 0], scale: [1, 1.15, 0.9, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' as const }}
          className="absolute -left-48 -top-48 h-[700px] w-[700px] rounded-full bg-blue-400/20 blur-[150px] dark:bg-blue-500/10"
        />
        <motion.div
          animate={{ x: [0, -50, 60, 0], y: [0, 50, -40, 0], scale: [1, 0.9, 1.1, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' as const, delay: 2 }}
          className="absolute -bottom-48 -right-48 h-[700px] w-[700px] rounded-full bg-indigo-400/20 blur-[150px] dark:bg-indigo-500/10"
        />
        <motion.div
          animate={{ x: [0, 40, -30, 0], y: [0, -30, 50, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' as const, delay: 1 }}
          className="absolute left-1/3 top-1/3 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-violet-400/15 blur-[120px] dark:bg-violet-500/5"
        />
        <div className="grid-pattern absolute inset-0 opacity-50" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center pt-20 text-center md:pt-28 lg:pt-32">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-blue-50 px-4 py-1.5 text-xs font-medium text-blue-700 dark:border-blue-800/50 dark:bg-blue-950/50 dark:text-blue-300">
              <Sparkles className="h-3.5 w-3.5" />
              Now with AI-powered receipt scanning
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            <span className="text-gray-900 dark:text-white">
              AI Powered{' '}
            </span>
            <span className="gradient-text">
              Enterprise Expense
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">Management</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-500 dark:text-gray-400 sm:text-xl"
          >
            {APP_DESCRIPTION}. Automate expense tracking, streamline approvals,
            and unlock AI-driven financial insights — all in one platform.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
          >
            <Link href="/register">
              <Button size="lg" className="h-12 gap-2 px-8 text-base shadow-lg shadow-blue-500/25">
                Start Free Trial
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button
                variant="outline"
                size="lg"
                className="h-12 gap-2 px-8 text-base"
              >
                <Clock className="h-4 w-4" />
                See How It Works
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-12"
          >
            {[
              { value: '10K+', label: 'Companies' },
              { value: '99.9%', label: 'Uptime' },
              { value: '50M+', label: 'Expenses Processed' },
              { value: '4.8★', label: 'User Rating' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <AnimatedCounter value={stat.value} />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>

          {/* Abstract 3D-like illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="relative mt-20 w-full max-w-4xl"
          >
            <div className="relative mx-auto aspect-[16/9] overflow-hidden rounded-2xl border border-gray-200/60 bg-white/50 shadow-2xl shadow-blue-500/10 backdrop-blur-sm dark:border-gray-800/60 dark:bg-gray-900/50">
              {/* Inner gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30" />

              {/* Mock dashboard UI */}
              <div className="relative p-4 sm:p-6 lg:p-8">
                {/* Top bar */}
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600" />
                    <div>
                      <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                      <div className="mt-1 h-2 w-16 rounded bg-gray-100 dark:bg-gray-800" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800" />
                    <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800" />
                  </div>
                </div>

                {/* Stats cards */}
                <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4">
                  {[
                    { label: 'Total Spend', value: '$284,500', color: 'bg-blue-500' },
                    { label: 'Pending', value: '12', color: 'bg-amber-500' },
                    { label: 'Savings', value: '$12,400', color: 'bg-emerald-500' },
                  ].map((card) => (
                    <div
                      key={card.label}
                      className="rounded-xl border border-gray-200/50 bg-white/80 p-3 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/80 sm:p-4"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <div className={cn('h-2 w-2 rounded-full', card.color)} />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {card.label}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                        {card.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Chart area */}
                <div className="mb-4 rounded-xl border border-gray-200/50 bg-white/60 p-4 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/60">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Monthly Trend
                    </span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400">
                      +12.5% vs last month
                    </span>
                  </div>
                  <div className="flex items-end gap-2 sm:gap-3">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 88].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 0.5, delay: 1.2 + i * 0.05 }}
                        className="flex-1 rounded-t-md bg-gradient-to-t from-blue-500 to-indigo-500 opacity-80"
                        style={{ height: `${h}%`, minHeight: 20 }}
                      />
                    ))}
                  </div>
                </div>

                {/* Table preview */}
                <div className="space-y-2">
                  {[1, 2, 3].map((row) => (
                    <div
                      key={row}
                      className="flex items-center gap-3 rounded-lg bg-white/40 p-2.5 backdrop-blur-sm dark:bg-gray-800/40"
                    >
                      <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-700" />
                      <div className="flex-1">
                        <div className="h-2.5 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                        <div className="mt-1.5 h-2 w-20 rounded bg-gray-100 dark:bg-gray-800" />
                      </div>
                      <div className="h-2.5 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Glow effect */}
            <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-violet-500/10 blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// 
// Features Section
// 

function FeaturesSection() {
  return (
    <Section
      id="features"
      className="relative border-t border-gray-200/60 bg-white py-24 dark:border-gray-800/60 dark:bg-gray-950 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div variants={fadeInUp} className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-blue-50 px-4 py-1.5 text-xs font-medium text-blue-700 dark:border-blue-800/50 dark:bg-blue-950/50 dark:text-blue-300">
            Features
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Everything you need to manage expenses
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            Powerful features that transform how your company handles expense
            management, from receipt capture to financial insights.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              custom={i}
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-2xl border border-gray-200/60 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 dark:border-gray-800/60 dark:bg-gray-900 dark:hover:shadow-blue-500/10"
            >
              <div
                className={cn(
                  'mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg',
                  feature.gradient,
                )}
              >
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                {feature.description}
              </p>

              {/* Hover gradient overlay */}
              <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  )
}

// 
// How It Works Section
// 

function HowItWorksSection() {
  return (
    <Section
      id="how-it-works"
      className="relative border-t border-gray-200/60 bg-gray-50 py-24 dark:border-gray-800/60 dark:bg-gray-900 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div variants={fadeInUp} className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-200/60 bg-violet-50 px-4 py-1.5 text-xs font-medium text-violet-700 dark:border-violet-800/50 dark:bg-violet-950/50 dark:text-violet-300">
            How It Works
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Three simple steps
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            Get started in minutes. No training required. Your team will thank
            you.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="mt-16 grid gap-8 md:grid-cols-3"
        >
          {HOW_IT_WORKS.map((step, i) => (
            <motion.div
              key={step.step}
              variants={fadeInUp}
              custom={i}
              className="relative"
            >
              {/* Connector line (desktop) */}
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="absolute left-16 top-12 hidden h-0.5 w-[calc(100%-4rem)] bg-gradient-to-r from-blue-200 to-transparent dark:from-blue-800 md:block" />
              )}

              <div className="relative flex flex-col items-center text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg shadow-blue-500/10 ring-1 ring-blue-200/50 dark:from-blue-950/50 dark:to-indigo-950/50 dark:ring-blue-800/50">
                  <step.icon className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="mb-2 text-sm font-semibold tracking-wider text-blue-600 dark:text-blue-400">
                  Step {step.step}
                </span>
                <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="max-w-sm text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  )
}

// 
// Pricing Section
// 

function PricingSection() {
  const tiers = COMPANY_TIERS.map((tier) => ({
    ...tier,
    price:
      tier.monthlyPrice === -1
        ? 'Custom'
        : `$${tier.monthlyPrice}`,
    period: tier.monthlyPrice === -1 ? '' : '/month',
    users:
      tier.maxUsers === -1 ? 'Unlimited' : `Up to ${tier.maxUsers}`,
  }))

  return (
    <Section
      id="pricing"
      className="relative border-t border-gray-200/60 bg-white py-24 dark:border-gray-800/60 dark:bg-gray-950 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div variants={fadeInUp} className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/60 bg-emerald-50 px-4 py-1.5 text-xs font-medium text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/50 dark:text-emerald-300">
            Pricing
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Plans for every stage
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            Start free, scale as you grow. No hidden fees or surprise charges.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="mt-16 grid gap-6 lg:grid-cols-4"
        >
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.label}
              variants={fadeInUp}
              custom={i}
              className={cn(
                'relative flex flex-col rounded-2xl border p-6 shadow-sm transition-all duration-300 hover:shadow-lg sm:p-8',
                tier.highlighted
                  ? 'border-blue-200 bg-blue-50/50 shadow-blue-500/10 hover:shadow-blue-500/20 dark:border-blue-800/50 dark:bg-blue-950/30'
                  : 'border-gray-200/60 bg-white dark:border-gray-800/60 dark:bg-gray-900',
              )}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 text-xs font-medium text-white shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {tier.label}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {tier.description}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {tier.period}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  {tier.users}
                </p>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href="/register">
                <Button
                  variant={tier.highlighted ? 'default' : 'outline'}
                  className={cn(
                    'w-full',
                    tier.highlighted &&
                      'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700',
                  )}
                >
                  {tier.label === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </Button>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  )
}

// 
// Testimonials Section
// 

function TestimonialsSection() {
  return (
    <Section className="relative border-t border-gray-200/60 bg-gray-50 py-24 dark:border-gray-800/60 dark:bg-gray-900 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div variants={fadeInUp} className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/60 bg-amber-50 px-4 py-1.5 text-xs font-medium text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/50 dark:text-amber-300">
            Testimonials
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Trusted by industry leaders
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            See why thousands of companies choose FinFlow AI for their expense
            management needs.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="mt-16 grid gap-6 md:grid-cols-3"
        >
          {TESTIMONIALS.map((testimonial, i) => (
            <motion.div
              key={testimonial.author}
              variants={fadeInUp}
              custom={i}
              className="flex flex-col rounded-2xl border border-gray-200/60 bg-white p-6 shadow-sm dark:border-gray-800/60 dark:bg-gray-900 sm:p-8"
            >
              <StarRating rating={testimonial.rating} />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <div className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-sm font-bold text-white">
                  {testimonial.author
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {testimonial.author}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  )
}

// 
// CTA Section
// 

function CTASection() {
  return (
    <Section className="relative border-t border-gray-200/60 bg-white py-24 dark:border-gray-800/60 dark:bg-gray-950 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 px-6 py-16 text-center shadow-2xl shadow-blue-500/25 sm:px-16 sm:py-24"
        >
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute left-1/3 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-white/5 blur-2xl" />
          </div>

          <motion.h2
            variants={fadeInUp}
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
          >
            Ready to transform your expense management?
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mx-auto mt-4 max-w-xl text-lg text-blue-100"
          >
            Join thousands of companies already saving time and money with
            FinFlow AI. Get started free, no credit card required.
          </motion.p>
          <motion.div variants={fadeInUp} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button
                size="lg"
                className="h-12 gap-2 bg-white px-8 text-base font-semibold text-blue-700 shadow-xl hover:bg-blue-50"
              >
                Start Free Trial
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="h-12 gap-2 border-white/30 bg-white/10 px-8 text-base font-medium text-white shadow-lg backdrop-blur-sm hover:bg-white/20"
              >
                Sign In
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </Section>
  )
}

// 
// Main Page
// 

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
