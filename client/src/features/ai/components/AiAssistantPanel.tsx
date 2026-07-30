'use client'

import { useState, type KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot,
  Sparkles,
  X,
  ChevronRight,
  ChevronLeft,
  Send,
  Loader2,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Wallet,
  TrendingDown,
  FileText,
  Zap,
} from 'lucide-react'

import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAiStore } from '../stores/ai-store'
import { useAiChat } from '../hooks/useAi'
import type { AiMessage } from '@/types'

// 
// Types
// 

export interface AiAssistantPanelProps {
  /** Optional class name for the root element. */
  className?: string
  /** The company ID for context-aware suggestions. */
  companyId?: string
  /** Whether the panel starts collapsed. */
  defaultCollapsed?: boolean
}

// 
// Quick action config
// 

interface QuickAction {
  id: string
  label: string
  icon: typeof Bot
  prompt: string
  color: string
  bgColor: string
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'summarize',
    label: 'Summarize',
    icon: FileText,
    prompt: 'Give me a summary of this month expenses',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/50',
  },
  {
    id: 'categorize',
    label: 'Categorize',
    icon: BarChart3,
    prompt: 'Categorize my uncategorized expenses',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/50',
  },
  {
    id: 'predict',
    label: 'Predict',
    icon: TrendingUp,
    prompt: 'Predict my spending for next month',
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-50 dark:bg-violet-950/50',
  },
  {
    id: 'insights',
    label: 'Insights',
    icon: Lightbulb,
    prompt: 'Show me spending insights',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/50',
  },
  {
    id: 'health',
    label: 'Health',
    icon: Wallet,
    prompt: 'What is my financial health score?',
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-950/50',
  },
  {
    id: 'anomalies',
    label: 'Anomalies',
    icon: AlertTriangle,
    prompt: 'Are there any spending anomalies?',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950/50',
  },
]

// 
// Animation variants
// 

const panelVariants = {
  expanded: {
    width: 380,
    opacity: 1,
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const },
  },
  collapsed: {
    width: 56,
    opacity: 1,
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const },
  },
}

const contentVariants = {
  expanded: {
    opacity: 1,
    transition: { delay: 0.1, duration: 0.2 },
  },
  collapsed: {
    opacity: 0,
    transition: { duration: 0.1 },
  },
}

// 
// Sub-components
// 

function MessageBubble({ message }: { message: AiMessage }) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-2', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      <Avatar className="h-6 w-6 shrink-0">
        <AvatarFallback
          className={cn(
            'text-[10px]',
            isUser
              ? 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
              : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
          )}
        >
          {isUser ? 'U' : <Bot className="h-3 w-3" />}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          'max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed',
          isUser
            ? 'rounded-tr-sm bg-blue-600 text-white dark:bg-blue-500'
            : 'rounded-tl-sm bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
        )}
      >
        {message.content}
      </div>
    </motion.div>
  )
}

// 
// Main Component
// 

/**
 * Collapsible AI assistant side panel with chat, quick actions,
 * and context-aware suggestions.
 *
 * @example
 * ```tsx
 * <AiAssistantPanel companyId="company-123" />
 * ```
 */
export function AiAssistantPanel({
  className,
  companyId,
  defaultCollapsed = true,
}: AiAssistantPanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const [input, setInput] = useState('')

  const currentChat = useAiStore((s) => s.currentChat)
  const isLoading = useAiStore((s) => s.isLoading)
  const suggestions = useAiStore((s) => s.suggestions)
  const appendMessage = useAiStore((s) => s.appendMessage)
  const setLoading = useAiStore((s) => s.setLoading)
  const setError = useAiStore((s) => s.setError)

  const chatMutation = useAiChat()

  const messages = currentChat?.messages ?? []

  //  Send message 

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    setInput('')

    const userMessage: AiMessage = {
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    }
    appendMessage(userMessage)
    setLoading(true)
    setError(null)

    try {
      const response = await chatMutation.mutateAsync({
        message: trimmed,
        context: companyId ? { companyId } : undefined,
      })

      appendMessage({
        role: 'assistant',
        content: response.reply,
        timestamp: new Date(),
      })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to get AI response'
      setError(message)
      appendMessage({
        role: 'assistant',
        content: `Error: ${message}`,
        timestamp: new Date(),
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleQuickAction = async (action: QuickAction) => {
    if (isLoading) return

    appendMessage({
      role: 'user',
      content: action.prompt,
      timestamp: new Date(),
    })
    setLoading(true)
    setError(null)

    try {
      const response = await chatMutation.mutateAsync({
        message: action.prompt,
        context: companyId ? { companyId } : undefined,
      })

      appendMessage({
        role: 'assistant',
        content: response.reply,
        timestamp: new Date(),
      })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to get AI response'
      setError(message)
      appendMessage({
        role: 'assistant',
        content: `Error: ${message}`,
        timestamp: new Date(),
      })
    } finally {
      setLoading(false)
    }
  }

  //  Render 

  return (
    <motion.div
      variants={panelVariants}
      animate={collapsed ? 'collapsed' : 'expanded'}
      initial={false}
      className={cn(
        'relative flex flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/80 shadow-xl backdrop-blur-xl dark:border-gray-700/30 dark:bg-gray-900/80',
        collapsed ? 'items-center' : '',
        className,
      )}
    >
      {/*  Toggle Button  */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          'absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300',
          collapsed && 'right-auto',
        )}
        aria-label={collapsed ? 'Expand AI panel' : 'Collapse AI panel'}
      >
        {collapsed ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>

      {/*  Collapsed State  */}
      <AnimatePresence>
        {collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 py-6"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col items-center gap-1">
              {QUICK_ACTIONS.map((action) => {
                const ActionIcon = action.icon
                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => {
                      setCollapsed(false)
                      setTimeout(() => handleQuickAction(action), 300)
                    }}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-xl transition-all hover:scale-110 active:scale-95',
                      action.bgColor,
                    )}
                    title={action.label}
                  >
                    <ActionIcon className={cn('h-4 w-4', action.color)} />
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/*  Expanded Content  */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            variants={contentVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="flex h-full flex-col"
          >
            {/*  Header  */}
            <div className="flex items-center gap-2 border-b border-gray-200/50 px-4 py-3 dark:border-gray-700/50">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-semibold text-gray-900 dark:text-white">
                  AI Assistant
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setCollapsed(true)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/*  Quick Actions  */}
            <div className="grid grid-cols-2 gap-1.5 p-3">
              {QUICK_ACTIONS.map((action) => {
                const ActionIcon = action.icon
                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => handleQuickAction(action)}
                    disabled={isLoading}
                    className={cn(
                      'flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium transition-all hover:shadow-sm active:scale-[0.98] disabled:opacity-50',
                      action.bgColor,
                    )}
                  >
                    <ActionIcon className={cn('h-3.5 w-3.5 shrink-0', action.color)} />
                    <span className="truncate text-gray-700 dark:text-gray-300">
                      {action.label}
                    </span>
                  </button>
                )
              })}
            </div>

            <Separator className="mx-3 w-auto" />

            {/*  Context Suggestions  */}
            {suggestions.length > 0 && (
              <div className="px-3 py-2">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Suggestions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.slice(0, 4).map((s) => (
                    <Badge
                      key={s.id}
                      variant="outline"
                      className="cursor-pointer text-[10px] transition-colors hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/50 dark:hover:text-blue-300"
                      onClick={() =>
                        handleQuickAction({
                          id: s.id,
                          label: s.title,
                          icon: Zap,
                          prompt: s.description,
                          color: 'text-blue-600',
                          bgColor: 'bg-blue-50',
                        })
                      }
                    >
                      <Zap className="mr-1 h-2.5 w-2.5" />
                      {s.title}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator className="mx-3 w-auto" />

            {/*  Messages  */}
            <ScrollArea className="flex-1 px-3 py-2">
              <div className="flex flex-col gap-2">
                {messages.length === 0 && (
                  <p className="py-6 text-center text-[11px] text-gray-400 dark:text-gray-500">
                    Ask a question or try a quick action above
                  </p>
                )}
                {messages.map((msg, idx) => (
                  <MessageBubble
                    key={`${msg.role}-${idx}-${msg.timestamp}`}
                    message={msg}
                  />
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Thinking...
                  </div>
                )}
              </div>
            </ScrollArea>

            {/*  Input  */}
            <div className="border-t border-gray-200/50 p-3 dark:border-gray-700/50">
              <div className="flex items-center gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask AI..."
                  disabled={isLoading}
                  className="h-8 border-gray-200 bg-white/60 text-xs dark:border-gray-700 dark:bg-gray-800/60"
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="h-8 w-8 shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
