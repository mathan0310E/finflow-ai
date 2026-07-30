'use client'
import { useRef, useEffect, useState, type KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAiStore, type AiMode } from '../stores/ai-store'
import { useAiChat } from '../hooks/useAi'
import type { AiMessage } from '@/types'
// 
// Constants
// 
const QUICK_ACTIONS: { mode: AiMode; label: string; prompt: string }[] = [
  {
    mode: 'summary',
    label: 'Summarize Month',
    prompt: 'Give me a brief summary of my spending this month',
  },
  {
    mode: 'insights',
    label: 'Spending Insights',
    prompt: 'What are the key insights from my recent spending?',
  },
  {
    mode: 'categorize',
    label: 'Categorize',
    prompt: 'Help me categorize my recent uncategorized expenses',
  },
  {
    mode: 'health',
    label: 'Health Score',
    prompt: 'What is my company financial health score?',
  },
  {
    mode: 'predict',
    label: 'Predict Spending',
    prompt: 'Predict my spending for next month based on recent trends',
  },
]
// 
// Animation variants
// 
const messageVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 },
  },
}
const typingDotVariants = {
  animate: {
    y: ['0%', '-50%', '0%'],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
}
// 
// Sub-components
// 
function TypingIndicator() {
  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      className="flex items-start gap-3 px-4"
    >
      <Avatar className="h-8 w-8 shrink-0 ring-2 ring-blue-200 dark:ring-blue-800">
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-blue-50 px-4 py-3 dark:bg-blue-950/50">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            variants={typingDotVariants}
            animate="animate"
            className="inline-block h-2 w-2 rounded-full bg-blue-400 dark:bg-blue-500"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </motion.div>
  )
}
function ChatMessage({ message }: { message: AiMessage }) {
  const isUser = message.role === 'user'
  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        'flex items-start gap-3 px-4',
        isUser ? 'flex-row-reverse' : 'flex-row',
      )}
    >
      {/* Avatar */}
      <Avatar
        className={cn(
          'h-8 w-8 shrink-0 ring-2',
          isUser
            ? 'ring-gray-200 dark:ring-gray-700'
            : 'ring-blue-200 dark:ring-blue-800',
        )}
      >
        <AvatarFallback
          className={cn(
            isUser
              ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
              : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white',
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      {/* Bubble */}
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm',
          isUser
            ? 'rounded-tr-sm bg-blue-600 text-white dark:bg-blue-500'
            : 'rounded-tl-sm bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100',
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <span
          className={cn(
            'mt-1 block text-[10px] opacity-60',
            isUser ? 'text-right text-blue-100' : 'text-left text-gray-400',
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </motion.div>
  )
}
// 
// Props
// 
export interface AiChatProps {
  /** Optional class name for the root element. */
  className?: string
  /** Placeholder text for the input field. */
  placeholder?: string
  /** Maximum height of the message area. */
  maxHeight?: string
  /** Show quick action buttons below the input. */
  showQuickActions?: boolean
  /** Callback when a quick action is triggered. */
  onQuickAction?: (prompt: string) => void
}
// 
// Main Component
// 
/**
 * AI Chat interface with message list, typing indicator, input bar,
 * and optional quick action buttons. Uses glassmorphism styling and
 * Framer Motion animations.
 *
 * @example
 * ```tsx
 * <AiChat
 *   showQuickActions
 *   onQuickAction={(prompt) => console.log(prompt)}
 * />
 * ```
 */
export function AiChat({
  className,
  placeholder = 'Ask FinFlow AI anything...',
  maxHeight = '500px',
  showQuickActions = false,
  onQuickAction,
}: AiChatProps) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const currentChat = useAiStore((s) => s.currentChat)
  const isLoading = useAiStore((s) => s.isLoading)
  const appendMessage = useAiStore((s) => s.appendMessage)
  const setLoading = useAiStore((s) => s.setLoading)
  const setError = useAiStore((s) => s.setError)
  const chatMutation = useAiChat()
  const messages = currentChat?.messages ?? []
  //  Auto-scroll on new messages 
  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current
      requestAnimationFrame(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
      })
    }
  }, [messages, isLoading])
  //  Send message 
  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return
    setInput('')
    // Add user message optimistically
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
        context: currentChat?.context,
      })
      const assistantMessage: AiMessage = {
        role: 'assistant',
        content: response.reply,
        timestamp: new Date(),
      }
      appendMessage(assistantMessage)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to get AI response'
      setError(message)
      // Add error message
      const errorMessage: AiMessage = {
        role: 'assistant',
        content: `I'm sorry, I encountered an error: ${message}. Please try again.`,
        timestamp: new Date(),
      }
      appendMessage(errorMessage)
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
  const handleQuickAction = (prompt: string) => {
    setInput(prompt)
    onQuickAction?.(prompt)
    // Auto-send after a brief delay so the input populates
    setTimeout(() => {
      setInput('')
      const userMessage: AiMessage = {
        role: 'user',
        content: prompt,
        timestamp: new Date(),
      }
      appendMessage(userMessage)
      setLoading(true)
      setError(null)
      chatMutation
        .mutateAsync({ message: prompt })
        .then((response) => {
          const assistantMessage: AiMessage = {
            role: 'assistant',
            content: response.reply,
            timestamp: new Date(),
          }
          appendMessage(assistantMessage)
        })
        .catch((err) => {
          const msg = err instanceof Error ? err.message : 'Failed to get AI response'
          setError(msg)
          appendMessage({
            role: 'assistant',
            content: `I'm sorry, I encountered an error: ${msg}. Please try again.`,
            timestamp: new Date(),
          })
        })
        .finally(() => setLoading(false))
    }, 100)
  }
  //  Render 
  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/70 shadow-xl backdrop-blur-xl dark:border-gray-700/30 dark:bg-gray-900/70',
        className,
      )}
    >
      {/*  Header  */}
      <div className="flex items-center gap-2 border-b border-gray-200/50 px-5 py-3 dark:border-gray-700/50">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            FinFlow AI
          </h3>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            {isLoading ? 'Thinking...' : 'Ask me anything'}
          </p>
        </div>
      </div>
      {/*  Messages  */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div
          className="flex flex-col gap-4 py-4"
          style={{ maxHeight }}
        >
          {messages.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-950/50">
                <Bot className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                How can I help you?
              </h4>
              <p className="max-w-[260px] text-xs text-gray-500 dark:text-gray-400">
                Ask about expenses, get insights, categorize transactions, or predict
                future spending.
              </p>
            </motion.div>
          )}
          <AnimatePresence mode="popLayout">
            {messages.map((msg, idx) => (
              <ChatMessage key={`${msg.role}-${idx}-${msg.timestamp}`} message={msg} />
            ))}
          </AnimatePresence>
          {isLoading && <TypingIndicator />}
        </div>
      </ScrollArea>
      {/*  Quick Actions  */}
      {showQuickActions && messages.length === 0 && (
        <div className="flex flex-wrap gap-2 border-t border-gray-200/50 px-4 py-3 dark:border-gray-700/50">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.mode}
              type="button"
              onClick={() => handleQuickAction(action.prompt)}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/60 px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 active:scale-95 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-400 dark:hover:border-blue-800 dark:hover:bg-blue-950/50 dark:hover:text-blue-300"
            >
              <Sparkles className="h-3 w-3" />
              {action.label}
            </button>
          ))}
        </div>
      )}
      {/*  Input Bar  */}
      <div className="border-t border-gray-200/50 p-4 dark:border-gray-700/50">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1 border-gray-200 bg-white/80 text-sm dark:border-gray-700 dark:bg-gray-800/80"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-300 disabled:shadow-none dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
