import * as React from 'react'
import * as ToastPrimitives from '@radix-ui/react-toast'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { cn } from '@/lib/cn'

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]',
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default:
          'border-gray-200 bg-white text-gray-950 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-50',
        destructive:
          'destructive group border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-50',
        success:
          'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-50',
        warning:
          'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface ToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>,
    VariantProps<typeof toastVariants> {}

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  ToastProps
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      'inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-transparent px-3 text-sm font-medium ring-offset-white transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-red-100 group-[.destructive]:hover:border-red-50 group-[.destructive]:hover:bg-red-100 group-[.destructive]:focus:ring-red-400 dark:border-gray-700 dark:ring-offset-gray-900 dark:hover:bg-gray-800 dark:focus:ring-blue-400 dark:group-[.destructive]:border-red-800 dark:group-[.destructive]:hover:border-red-700 dark:group-[.destructive]:hover:bg-red-900 dark:group-[.destructive]:focus:ring-red-400',
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      'absolute right-2 top-2 rounded-md p-1 text-gray-500 opacity-0 transition-opacity hover:text-gray-900 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600 dark:text-gray-400 dark:hover:text-gray-50',
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn('text-sm font-semibold', className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn('text-sm opacity-90', className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastActionType = {
  title: string
  description?: string
  variant?: 'default' | 'destructive' | 'success' | 'warning'
  action?: {
    label: string
    onClick: () => void
  }
}

type ToastState = {
  toasts: (ToastActionType & { id: string })[]
}

// Simple toast state management
const listeners = new Set<(state: ToastState) => void>()
let memoryState: ToastState = { toasts: [] }

function dispatch(action: { type: 'ADD_TOAST'; toast: ToastActionType } | { type: 'DISMISS_TOAST'; toastId: string }) {
  if (action.type === 'ADD_TOAST') {
    const id = Math.random().toString(36).slice(2)
    memoryState = {
      ...memoryState,
      toasts: [...memoryState.toasts, { ...action.toast, id }],
    }
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      dispatch({ type: 'DISMISS_TOAST', toastId: id })
    }, 5000)
  } else if (action.type === 'DISMISS_TOAST') {
    memoryState = {
      ...memoryState,
      toasts: memoryState.toasts.filter((t) => t.id !== action.toastId),
    }
  }
  listeners.forEach((listener) => listener(memoryState))
}

function useToast() {
  const [state, setState] = React.useState<ToastState>(memoryState)

  React.useEffect(() => {
    listeners.add(setState)
    return () => {
      listeners.delete(setState)
    }
  }, [])

  return {
    ...state,
    toast: (props: ToastActionType) => {
      dispatch({ type: 'ADD_TOAST', toast: props })
    },
    dismiss: (toastId: string) => {
      dispatch({ type: 'DISMISS_TOAST', toastId })
    },
  }
}

function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <ToastProvider>
      {toasts.map((toast) => {
        const { id, title, description, variant, action } = toast
        return (
          <Toast key={id} variant={variant}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action && (
              <ToastAction altText={action.label} onClick={action.onClick}>
                {action.label}
              </ToastAction>
            )}
            <ToastClose onClick={() => dismiss(id)} />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

export {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  useToast,
  Toaster,
}
