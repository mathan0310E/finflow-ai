'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type Theme = 'light' | 'dark' | 'system'

export interface UIState {
  /** Desktop sidebar collapsed (icon-only) state */
  sidebarCollapsed: boolean

  /** Mobile sidebar overlay open state */
  sidebarOpen: boolean

  /** Current theme preference */
  theme: Theme

  /** Command palette open state */
  commandPaletteOpen: boolean

  // ── Actions ──────────────────────────────────

  toggleSidebarCollapsed: () => void
  setSidebarCollapsed: (collapsed: boolean) => void

  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void

  setTheme: (theme: Theme) => void

  toggleCommandPalette: () => void
  setCommandPaletteOpen: (open: boolean) => void
}

// ──────────────────────────────────────────────
// Store
// ──────────────────────────────────────────────

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // ── Initial state ───────────────────────────

      sidebarCollapsed: false,
      sidebarOpen: false,
      theme: 'system',
      commandPaletteOpen: false,

      // ── Sidebar collapsed (desktop) ─────────────

      toggleSidebarCollapsed: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // ── Sidebar open (mobile overlay) ───────────

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // ── Theme ───────────────────────────────────

      setTheme: (theme) => set({ theme }),

      // ── Command palette ─────────────────────────

      toggleCommandPalette: () =>
        set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),

      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
    }),
    {
      name: 'finflow-ui',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    },
  ),
)
