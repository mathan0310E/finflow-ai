'use client'

import { useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search } from 'lucide-react'

import { cn } from '@/lib/cn'

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface FaqItem {
  question: string
  answer: ReactNode
}

interface FaqSectionProps {
  items?: FaqItem[]
  className?: string
  /** Optional search filter */
  searchQuery?: string
}

// ──────────────────────────────────────────────
// Animation variants
// ──────────────────────────────────────────────

const accordionVariants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as const },
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
  },
}

const chevronVariants = {
  collapsed: { rotate: 0 },
  expanded: { rotate: 180 },
}

// ──────────────────────────────────────────────
// Default FAQ data
// ──────────────────────────────────────────────

const DEFAULT_FAQ_ITEMS: FaqItem[] = [
  {
    question: 'How do I submit my first expense?',
    answer: (
      <div className="space-y-2">
        <p>
          Submitting an expense is simple. Navigate to the{' '}
          <strong>Expenses</strong> section from your dashboard, click the
          &ldquo;New Expense&rdquo; button, and fill in the required details
          — amount, category, date, and a brief description. You can upload a
          photo of your receipt, and our AI will automatically extract the
          relevant information. Once submitted, it will route through your
          organization&apos;s approval workflow.
        </p>
      </div>
    ),
  },
  {
    question: 'How does AI categorization work?',
    answer: (
      <div className="space-y-2">
        <p>
          Our AI, powered by OpenRouter AI (GPT-3.5-turbo), automatically
          analyzes your expense descriptions, merchant names, and receipt data
          to suggest the most appropriate category. It learns from your
          organization&apos;s historical data to improve accuracy over time.
          You can always override the suggested category manually.
        </p>
      </div>
    ),
  },
  {
    question: 'What is the approval workflow process?',
    answer: (
      <div className="space-y-2">
        <p>
          Expenses go through a multi-level approval chain based on your
          organization&apos;s configuration:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Expenses under $5,000 require manager approval</li>
          <li>Expenses between $5,000 and $25,000 need finance approval</li>
          <li>Expenses above $100,000 require CEO approval</li>
        </ul>
        <p>
          You can track the status of your expense in real-time from the
          expense detail page.
        </p>
      </div>
    ),
  },
  {
    question: 'How secure is my financial data?',
    answer: (
      <div className="space-y-2">
        <p>
          Security is our top priority. We implement industry-standard
          measures including:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>256-bit encryption at rest and in transit</li>
          <li>Firebase Authentication with multi-factor authentication (MFA)</li>
          <li>Role-based access control (RBAC)</li>
          <li>Regular security audits and penetration testing</li>
          <li>SOC 2 Type II compliance (in progress)</li>
        </ul>
        <p>
          For more details, see our{' '}
          <a href="/security" className="text-blue-600 hover:underline dark:text-blue-400">
            Security Policy
          </a>.
        </p>
      </div>
    ),
  },
  {
    question: 'Can I export my expense data?',
    answer: (
      <div className="space-y-2">
        <p>
          Yes! You can export your expense data in multiple formats from the
          Reports section:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>CSV</strong> — for spreadsheet applications like Excel
            or Google Sheets
          </li>
          <li>
            <strong>PDF</strong> — for sharing and printing
          </li>
          <li>
            <strong>JSON</strong> — for API integrations and data portability
          </li>
        </ul>
        <p>
          Company administrators can also export data for all users within
          their organization.
        </p>
      </div>
    ),
  },
  {
    question: 'How do I invite team members to my company?',
    answer: (
      <div className="space-y-2">
        <p>
          Company administrators can invite team members from the{' '}
          <strong>Company Settings</strong> page. Click on
          &ldquo;Invite Members,&rdquo; enter their email addresses, assign
          roles (Employee, Manager, Finance, Admin), and send the invitations.
          New users will receive an email with a link to join your company
          workspace.
        </p>
      </div>
    ),
  },
  {
    question: 'What happens if I exceed my plan limits?',
    answer: (
      <div className="space-y-2">
        <p>
          If you approach or exceed your plan&apos;s limits (user count,
          expense volume, or storage), you&apos;ll receive email and in-app
          notifications. You can upgrade your plan at any time from the
          Settings page to unlock higher limits. Enterprise plans offer
          custom limits tailored to your organization&apos;s needs.
        </p>
      </div>
    ),
  },
  {
    question: 'Does FinFlow AI support multiple currencies?',
    answer: (
      <div className="space-y-2">
        <p>
          Yes! We support 30+ currencies including USD, EUR, GBP, INR, JPY,
          and more. Our AI automatically detects the currency from receipt
          scans and converts amounts based on real-time exchange rates. You
          can set your organization&apos;s default currency and individual
          expenses can be submitted in any supported currency.
        </p>
      </div>
    ),
  },
  {
    question: 'How do I set up budget alerts?',
    answer: (
      <div className="space-y-2">
        <p>
          Finance managers and administrators can configure budget thresholds
          for each department from the <strong>Budgets</strong> section. When
          a department&apos;s spending reaches 80%, 90%, and 100% of its
          allocated budget, automatic alerts are sent to the department
          manager and finance team. You can customize these thresholds and
          notification preferences.
        </p>
      </div>
    ),
  },
  {
    question: 'Can I use FinFlow AI on my mobile device?',
    answer: (
      <div className="space-y-2">
        <p>
          Absolutely! Our platform is fully responsive and optimized for
          mobile browsers. You can submit expenses, approve requests, and
          view reports from any device. A dedicated native mobile app for
          iOS and Android is currently in development and will be available
          for Business and Enterprise plan subscribers.
        </p>
      </div>
    ),
  },
]

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export function FaqSection({
  items = DEFAULT_FAQ_ITEMS,
  className,
  searchQuery = '',
}: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const filteredItems = searchQuery
    ? items.filter(
        (item) =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (typeof item.answer === 'string' &&
            item.answer.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    : items

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className={cn('divide-y divide-gray-200/60 dark:divide-gray-800/60', className)}>
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <Search className="mb-3 h-8 w-8 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No matching questions found
          </p>
        </div>
      ) : (
        filteredItems.map((item, index) => {
          const isOpen = openIndex === index
          return (
            <div key={index} className="group">
              <button
                type="button"
                onClick={() => handleToggle(index)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:cursor-pointer"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
              >
                <span
                  className={cn(
                    'text-sm font-medium transition-colors duration-200',
                    isOpen
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white',
                  )}
                >
                  {item.question}
                </span>
                <motion.div
                  variants={chevronVariants}
                  animate={isOpen ? 'expanded' : 'collapsed'}
                  className="shrink-0"
                >
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-colors duration-200',
                      isOpen
                        ? 'text-blue-500'
                        : 'text-gray-300 dark:text-gray-600',
                    )}
                  />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`faq-answer-${index}`}
                    key={`answer-${index}`}
                    variants={accordionVariants}
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    className="overflow-hidden"
                  >
                    <div className="pb-5 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })
      )}
    </div>
  )
}