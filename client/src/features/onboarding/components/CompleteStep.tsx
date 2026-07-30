'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Sparkles, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

// ── Props ──

export interface CompleteStepProps {
  isSaving: boolean
  error: string | null
  onComplete: () => void
  isCompanyFlow: boolean
}

// ── Confetti particle ──

interface Particle {
  id: number
  x: number
  y: number
  color: string
  size: number
  rotation: number
  delay: number
}

const PARTICLE_COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E',
  '#F97316', '#EAB308', '#22C55E', '#14B8A6',
  '#06B6D4', '#3B82F6',
]

// ── Component ──

export function CompleteStep({ isSaving, error, onComplete, isCompanyFlow }: CompleteStepProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    // Generate confetti particles
    const newParticles: Particle[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      size: 6 + Math.random() * 8,
      rotation: Math.random() * 360,
      delay: Math.random() * 0.5,
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="relative flex flex-col items-center justify-center py-8 text-center">
      {/* Confetti */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-sm"
            style={{
              left: `${p.x}%`,
              width: p.size,
              height: p.size * 1.5,
              backgroundColor: p.color,
              rotate: `${p.rotation}deg`,
            }}
            animate={{
              y: [0, 600],
              x: [0, (Math.random() - 0.5) * 100],
              rotate: [0, 720],
              opacity: [1, 0],
            }}
            transition={{
              duration: 2.5 + Math.random() * 1.5,
              delay: p.delay,
              ease: 'easeIn',
            }}
          />
        ))}
      </div>

      {/* Success icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const }}
        className="mb-6"
      >
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl shadow-emerald-500/30 ring-1 ring-white/20">
          <CheckCircle2 className="h-12 w-12 text-white" />
        </div>
      </motion.div>

      {/* Heading */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mb-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50"
      >
        You&apos;re all set!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mb-8 max-w-sm text-base leading-relaxed text-gray-500 dark:text-gray-400"
      >
        {isCompanyFlow
          ? 'Your company workspace has been configured. You\'re ready to start managing expenses with AI-powered automation.'
          : 'Your personal workspace is ready. Start tracking expenses and managing your budget.'}
      </motion.p>

      {/* Feature summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mb-8 grid w-full max-w-sm grid-cols-2 gap-3"
      >
        {features.map((feature, i) => (
          <motion.div
            key={feature.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + i * 0.08 }}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
          >
            <feature.icon className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {feature.label}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-400"
        >
          {error}
        </motion.div>
      )}

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <Button
          onClick={onComplete}
          disabled={isSaving}
          size="lg"
          className="h-12 gap-2 px-8 text-base shadow-lg shadow-blue-500/25"
        >
          {isSaving ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Setting up…</>
          ) : (
            <><Sparkles className="h-4 w-4" /> Go to Dashboard</>
          )}
        </Button>
      </motion.div>
    </div>
  )
}

// ── Feature items ──

const features = [
  { icon: CheckCircle2, label: 'Expense Tracking' },
  { icon: CheckCircle2, label: 'Receipt Scanning' },
  { icon: CheckCircle2, label: 'Approval Workflows' },
  { icon: CheckCircle2, label: 'AI Insights' },
]
