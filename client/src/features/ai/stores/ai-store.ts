'use client'

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { AiChat, AiMessage } from '@/types'

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type AiMode = 'chat' | 'categorize' | 'insights' | 'predict' | 'summary' | 'health'

export interface AiSuggestion {
  id: string
  type: 'insight' | 'trend' | 'warning' | 'action'
  title: string
  description: string
  icon?: string
}

export interface AiState {
  /** Full chat history for the current company. */
  chatHistory: AiChat[]

  /** Currently active chat. */
  currentChat: AiChat | null

  /** `true` while any AI request is in flight. */
  isLoading: boolean

  /** Last error message, or `null`. */
  error: string | null

  /** Active AI mode. */
  activeMode: AiMode

  /** Context-aware suggestions shown to the user. */
  suggestions: AiSuggestion[]

  /** Whether the AI panel is open. */
  panelOpen: boolean

  // ── Actions ──────────────────────────────────

  /** Set the full chat history. */
  setChatHistory: (history: AiChat[]) => void

  /** Set the current active chat. */
  setCurrentChat: (chat: AiChat | null) => void

  /** Append a message to the current chat. */
  appendMessage: (message: AiMessage) => void

  /** Set loading state. */
  setLoading: (loading: boolean) => void

  /** Set error state. */
  setError: (error: string | null) => void

  /** Set the active AI mode. */
  setActiveMode: (mode: AiMode) => void

  /** Overwrite suggestions list. */
  setSuggestions: (suggestions: AiSuggestion[]) => void

  /** Toggle the AI panel open/closed. */
  togglePanel: () => void

  /** Set panel open state. */
  setPanelOpen: (open: boolean) => void

  /** Clear all chat state. */
  clearChat: () => void

  /** Clear error. */
  clearError: () => void
}

// ──────────────────────────────────────────────
// Defaults
// ──────────────────────────────────────────────

const INITIAL_SUGGESTIONS: AiSuggestion[] = [
  {
    id: 'summarize',
    type: 'action',
    title: 'Summarize This Month',
    description: 'Get a concise overview of your monthly spending',
  },
  {
    id: 'categorize',
    type: 'action',
    title: 'Categorize Expenses',
    description: 'Auto-categorize your uncategorized expenses',
  },
  {
    id: 'insights',
    type: 'insight',
    title: 'Spending Insights',
    description: 'Discover patterns and anomalies in your spending',
  },
  {
    id: 'health',
    type: 'trend',
    title: 'Financial Health',
    description: 'Check your company financial health score',
  },
]

// ──────────────────────────────────────────────
// Store
// ──────────────────────────────────────────────

export const useAiStore = create<AiState>()(
  devtools(
    (set) => ({
      // ── Initial state ───────────────────────────

      chatHistory: [],
      currentChat: null,
      isLoading: false,
      error: null,
      activeMode: 'chat',
      suggestions: INITIAL_SUGGESTIONS,
      panelOpen: false,

      // ── Actions ─────────────────────────────────

      setChatHistory: (history) => set({ chatHistory: history }),

      setCurrentChat: (chat) => set({ currentChat: chat }),

      appendMessage: (message) =>
        set((state) => {
          if (!state.currentChat) {
            // Create a new chat with the first message
            const newChat: AiChat = {
              id: crypto.randomUUID?.() ?? Date.now().toString(36),
              companyId: '',
              userId: '',
              messages: [message],
              createdAt: new Date(),
              updatedAt: new Date(),
            }
            return {
              currentChat: newChat,
              chatHistory: [newChat, ...state.chatHistory],
            }
          }

          const updatedChat: AiChat = {
            ...state.currentChat,
            messages: [...state.currentChat.messages, message],
            updatedAt: new Date(),
          }

          return {
            currentChat: updatedChat,
            chatHistory: state.chatHistory.map((c) =>
              c.id === updatedChat.id ? updatedChat : c,
            ),
          }
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      setActiveMode: (mode) => set({ activeMode: mode }),

      setSuggestions: (suggestions) => set({ suggestions }),

      togglePanel: () => set((state) => ({ panelOpen: !state.panelOpen })),

      setPanelOpen: (open) => set({ panelOpen: open }),

      clearChat: () =>
        set({
          currentChat: null,
          error: null,
        }),

      clearError: () => set({ error: null }),
    }),
    { name: 'ai-store' },
  ),
)
