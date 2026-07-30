'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Plus, X, Mail, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/cn'

// ── Props ──

export interface InviteEntry {
  email: string
  role: 'employee' | 'dept_manager' | 'finance_manager'
}

export interface InviteStepProps {
  initialData?: InviteEntry[]
  onNext: (invites: InviteEntry[]) => void
  onBack: () => void
  onSkip: () => void
}

// ── Component ──

export function InviteStep({ initialData = [], onNext, onBack, onSkip }: InviteStepProps) {
  const [invites, setInvites] = useState<InviteEntry[]>(initialData)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'employee' | 'dept_manager' | 'finance_manager'>('employee')
  const [emailError, setEmailError] = useState('')

  const addInvite = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address')
      return
    }
    if (invites.some((inv) => inv.email === email.trim())) {
      setEmailError('This email has already been added')
      return
    }
    setInvites((prev) => [...prev, { email: email.trim(), role }])
    setEmail('')
    setEmailError('')
  }

  const removeInvite = (emailToRemove: string) => {
    setInvites((prev) => prev.filter((inv) => inv.email !== emailToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addInvite()
    }
  }

  return (
    <div className="py-4">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
          Invite your team
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Add team members to get them started on FinFlow AI
        </p>
      </div>

      {/* Add invite form */}
      <div className="mb-6 space-y-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              id="invite-email"
              type="email"
              placeholder="colleague@company.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
              onKeyDown={handleKeyDown}
              error={emailError}
              icon={<Mail className="h-4 w-4" />}
            />
          </div>
          <div className="w-36">
            <Select value={role} onValueChange={(val) => setRole(val as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="dept_manager">Manager</SelectItem>
                <SelectItem value="finance_manager">Finance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="button" variant="outline" onClick={addInvite} disabled={!email.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Invite list */}
      <AnimatePresence>
        {invites.length > 0 && (
          <div className="mb-6 space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {invites.length} team member{invites.length !== 1 ? 's' : ''} added
            </label>
            <div className="max-h-48 space-y-1.5 overflow-y-auto">
              {invites.map((invite, i) => (
                <motion.div
                  key={invite.email}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                      {invite.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn(
                      'text-[10px] font-medium uppercase tracking-wider rounded-full px-2 py-0.5',
                      invite.role === 'employee' && 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
                      invite.role === 'dept_manager' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
                      invite.role === 'finance_manager' && 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
                    )}>
                      {invite.role.replace('_', ' ')}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeInvite(invite.email)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onBack} className="gap-2" type="button">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onSkip} className="text-gray-400" type="button">
            Skip for now
          </Button>
          <Button onClick={() => onNext(invites)} className="gap-2" size="lg">
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
