import * as React from 'react'
import { type DialogProps } from '@radix-ui/react-dialog'
import { Search, Command as CommandIcon } from 'lucide-react'

import { cn } from '@/lib/cn'
import { Dialog, DialogContent } from '@/components/ui/dialog'

const Command = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex h-full w-full flex-col overflow-hidden rounded-xl bg-white text-gray-950 dark:bg-gray-900 dark:text-gray-50',
      className
    )}
    {...props}
  />
))
Command.displayName = 'Command'

interface CommandDialogProps extends DialogProps {}

const CommandDialog = ({ children, ...props }: CommandDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gray-500 dark:[&_[cmdk-group-heading]]:text-gray-400 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

const CommandInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <div
    className="flex items-center border-b border-gray-200 px-3 dark:border-gray-700"
    cmdk-input-wrapper=""
  >
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <input
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-xl bg-transparent py-3 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50 dark:placeholder:text-gray-500',
        className
      )}
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      {...props}
    />
  </div>
))
CommandInput.displayName = 'CommandInput'

const CommandList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('max-h-[300px] overflow-y-auto overflow-x-hidden', className)}
    {...props}
  />
))
CommandList.displayName = 'CommandList'

const CommandEmpty = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('py-6 text-center text-sm text-gray-500 dark:text-gray-400', className)}
    {...props}
  />
))
CommandEmpty.displayName = 'CommandEmpty'

const CommandGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    heading?: string
  }
>(({ className, heading, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'overflow-hidden p-1 text-gray-950 dark:text-gray-50 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gray-500 dark:[&_[cmdk-group-heading]]:text-gray-400',
      className
    )}
    {...props}
  >
    {heading && (
      <div cmdk-group-heading="">
        {heading}
      </div>
    )}
    {children}
  </div>
))
CommandGroup.displayName = 'CommandGroup'

const CommandSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('-mx-1 h-px bg-gray-200 dark:bg-gray-700', className)}
    {...props}
  />
))
CommandSeparator.displayName = 'CommandSeparator'

const CommandItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    selected?: boolean
    onSelect?: () => void
    shortcut?: string
  }
>(({ className, children, onSelect, shortcut, selected, ...props }, ref) => {
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onSelect?.()
      }
    },
    [onSelect]
  )

  return (
    <div
      ref={ref}
      role="option"
      aria-selected={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative flex cursor-default select-none items-center gap-2 rounded-lg px-2 py-1.5 text-sm outline-none transition-colors aria-selected:bg-blue-50 aria-selected:text-blue-700 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 hover:bg-gray-100 hover:text-gray-900 dark:aria-selected:bg-blue-900/30 dark:aria-selected:text-blue-300 dark:hover:bg-gray-800 dark:hover:text-gray-50',
        className
      )}
      {...props}
    >
      {children}
      {shortcut && (
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-gray-200 bg-gray-50 px-1.5 font-mono text-[10px] font-medium text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
          {shortcut}
        </kbd>
      )}
    </div>
  )
})
CommandItem.displayName = 'CommandItem'

const CommandShortcut = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  return (
    <kbd
      ref={ref}
      className={cn(
        'ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-gray-200 bg-gray-50 px-1.5 font-mono text-[10px] font-medium text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400',
        className
      )}
      {...props}
    />
  )
})
CommandShortcut.displayName = 'CommandShortcut'

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
