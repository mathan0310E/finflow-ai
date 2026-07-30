'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Code2,
  Globe,
  AtSign,
  Heart,
  ExternalLink,
  Mail,
  MessageCircle,
} from 'lucide-react'

import { cn } from '@/lib/cn'
import { APP_NAME } from '@/constants'
import { Button } from '@/components/ui/button'

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface FooterColumn {
  title: string
  links: { label: string; href: string }[]
}

interface SocialLink {
  icon: React.ElementType
  href: string
  label: string
}

// ──────────────────────────────────────────────
// Data
// ──────────────────────────────────────────────

const COLUMNS: FooterColumn[] = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/#features' },
      { label: 'Pricing', href: '/#pricing' },
      { label: 'API', href: '#' },
      { label: 'Changelog', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Blog', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'Security', href: '/security' },
      { label: 'DPA', href: '/dpa' },
      { label: 'AI Policy', href: '/ai-policy' },
      { label: 'Accessibility', href: '/accessibility' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '/help' },
      { label: 'FAQ', href: '/help#faq' },
      { label: 'Bug Report', href: '/help#bug-report' },
      { label: 'Feature Request', href: '/help#feature-request' },
      { label: 'Acceptable Use', href: '/acceptable-use' },
      { label: 'Refund Policy', href: '/refund' },
      { label: 'Disclaimer', href: '/disclaimer' },
    ],
  },
]

const SOCIAL_LINKS: SocialLink[] = [
  { icon: Code2, href: 'https://github.com', label: 'GitHub' },
  { icon: Globe, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: AtSign, href: 'https://twitter.com', label: 'Twitter' },
]

const SUPPORT_OPTIONS = [
  {
    icon: Mail,
    label: 'Email Support',
    desc: 'We respond within 24 hours',
    href: 'mailto:support@finflow.ai',
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    icon: MessageCircle,
    label: 'Live Chat',
    desc: 'Available Mon-Fri 9AM-6PM EST',
    href: '#',
    gradient: 'from-emerald-500 to-teal-500',
  },
]

// ──────────────────────────────────────────────
// Animation variants
// ──────────────────────────────────────────────

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.05, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
}

// ──────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────

function FooterSection({ title, links, index }: FooterColumn & { index: number }) {
  return (
    <motion.div
      variants={fadeInUp}
      custom={index}
      className="min-w-0"
    >
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
        {title}
      </h3>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="group inline-flex items-center gap-1 text-sm text-gray-500 transition-all duration-200 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              {link.label}
              <ExternalLink className="h-3 w-3 opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-60 group-hover:translate-x-0" />
            </Link>
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

function SocialLinkItem({ icon: Icon, href, label }: SocialLink) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200/60 bg-white/50 text-gray-400 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-gray-300/80 hover:bg-white hover:text-gray-700 hover:shadow-md dark:border-gray-700/60 dark:bg-gray-800/50 dark:text-gray-500 dark:hover:border-gray-600/80 dark:hover:bg-gray-800 dark:hover:text-gray-200"
    >
      <Icon className="h-4 w-4" />
    </Link>
  )
}

// ──────────────────────────────────────────────
// Main Footer Component
// ──────────────────────────────────────────────

export function Footer() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.footer
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={staggerContainer}
      className="relative border-t border-gray-200/60 bg-white/50 backdrop-blur-xl dark:border-gray-800/60 dark:bg-gray-950/50"
    >
      {/* Glassmorphism background accents */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-400/5 blur-3xl dark:bg-blue-500/5" />
        <div className="absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-indigo-400/5 blur-3xl dark:bg-indigo-500/5" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Top section: Brand + Support + Columns */}
        <div className="grid gap-12 lg:grid-cols-6">
          {/* Brand column */}
          <motion.div variants={fadeInUp} custom={0} className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 shadow-lg shadow-blue-500/20 ring-1 ring-white/20 transition-transform duration-200 group-hover:scale-105">
                <span className="text-base font-bold text-white">F</span>
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-gray-900 dark:text-white">
                  {APP_NAME}
                </span>
                <span className="block text-[10px] font-medium uppercase tracking-widest text-blue-600 dark:text-blue-400">
                  Enterprise
                </span>
              </div>
            </Link>

            <p className="mt-5 text-sm leading-relaxed text-gray-500 dark:text-gray-400 max-w-sm">
              AI-powered enterprise expense management platform. Smart approvals,
              real-time insights, AI categorization, and full financial control
              for modern businesses.
            </p>

            {/* Support quick-actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              {SUPPORT_OPTIONS.map((opt) => (
                <Link key={opt.label} href={opt.href}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-gray-200/70 bg-white/60 text-xs text-gray-600 backdrop-blur-sm hover:bg-white dark:border-gray-700/70 dark:bg-gray-800/60 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <div className={cn('flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br', opt.gradient)}>
                      <opt.icon className="h-3 w-3 text-white" />
                    </div>
                    {opt.label}
                  </Button>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Link columns */}
          {COLUMNS.map((col, i) => (
            <FooterSection key={col.title} {...col} index={i + 1} />
          ))}
        </div>

        {/* Divider */}
        <motion.div
          variants={fadeInUp}
          custom={5}
          className="my-12 border-t border-gray-200/60 dark:border-gray-800/60"
        />

        {/* Bottom bar */}
        <motion.div
          variants={fadeInUp}
          custom={6}
          className="flex flex-col items-center justify-between gap-6 sm:flex-row"
        >
          {/* Copyright */}
          <p className="text-xs text-gray-400 dark:text-gray-500">
            &copy; {new Date().getFullYear()} {APP_NAME} Enterprise. All rights reserved.
          </p>

          {/* Made with love */}
          <p className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            Made with
            <Heart className="h-3.5 w-3.5 fill-red-400 text-red-400" />
            by {APP_NAME} AI
          </p>

          {/* Social links */}
          <div className="flex items-center gap-2">
            {SOCIAL_LINKS.map((social) => (
              <SocialLinkItem key={social.label} {...social} />
            ))}
          </div>
        </motion.div>

        {/* Legal footer note */}
        <motion.p
          variants={fadeInUp}
          custom={7}
          className="mt-6 text-center text-[10px] leading-relaxed text-gray-300 dark:text-gray-600"
        >
          {APP_NAME} Enterprise is a AI-powered SaaS platform. Use of this service is subject to our{' '}
          <Link href="/terms" className="underline underline-offset-2 hover:text-gray-400 dark:hover:text-gray-500">
            Terms
          </Link>
          {' '}and{' '}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-gray-400 dark:hover:text-gray-500">
            Privacy Policy
          </Link>.
        </motion.p>
      </div>
    </motion.footer>
  )
}