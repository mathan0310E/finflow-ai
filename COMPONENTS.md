# FinFlow AI - Design System & Components

## Overview
Premium design system inspired by Apple, Stripe, Linear, Notion, and shadcn/ui.

## Design Tokens
- **Font**: Inter (system font stack)
- **Border Radius**: 0.625rem (default), full (rounded-full)
- **Shadows**: sm, md, lg, xl, 2xl (Tailwind defaults + custom)
- **Colors**: HSL-based with light/dark variants

## Theme
- Light mode: Clean whites, subtle grays, indigo primary
- Dark mode: Deep slate backgrounds, muted grays, blue primary
- System: Respects prefers-color-scheme

## UI Components (src/components/ui/)

| Component | Description |
|-----------|-------------|
| Button | 6 variants, 4 sizes, asChild support |
| Card | Animated hover, header/footer/content/title |
| Input | With label, error, icon support |
| Badge | 6 color variants |
| Avatar | With image fallback |
| Dialog | Animated modal with overlay |
| DropdownMenu | Full nested menus, keyboard nav |
| Select | Custom styled select |
| Tabs | Animated tab indicators |
| Switch | Animated toggle |
| Tooltip | Hover tooltips |
| Toast | Animated notification system |
| Skeleton | Pulse loading placeholders |
| Table | Responsive data tables |
| Progress | Animated progress bars |
| Command | Ctrl+K command palette |
| ScrollArea | Custom scrollbar |
| Separator | Horizontal/vertical |
| Label | Form label component |

## Layout Components (src/components/layout/)

| Component | Description |
|-----------|-------------|
| DashboardLayout | Main app layout (sidebar + header + content) |
| AuthLayout | Auth pages (centered card + gradient) |
| Sidebar | Premium animated sidebar with collapsible |
| Header | Floating glass header with search + actions |
| PageHeader | Reusable page header with actions |
| ThemeProvider | Dark/light mode provider |
| AuthGuard | Route protection with RBAC |

## Animation Patterns
- Page transitions: Framer Motion AnimatePresence
- Cards: Hover scale + shadow
- Sidebar: Smooth width animation
- Lists: Staggered children
- Numbers: Animated counters
- Loading: Skeleton pulse
- Modal: Scale + fade
- Toast: Slide from right

## Accessibility
- WCAG AA compliant colors
- Keyboard navigation everywhere
- ARIA labels on all interactive elements
- Focus rings visible
- Screen reader friendly
- Reduced motion support
