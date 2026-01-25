import React from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils'

export interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  side?: 'left' | 'right'
  size?: 'sm' | 'md' | 'lg'
  showCloseButton?: boolean
  className?: string
}

const drawerSizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

export const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  (
    {
      open,
      onClose,
      title,
      description,
      children,
      side = 'right',
      size = 'md',
      showCloseButton = true,
      className,
    },
    ref
  ) => {
    // Close on Escape key
    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && open) {
          onClose()
        }
      }

      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }, [open, onClose])

    // Prevent body scroll when drawer is open
    React.useEffect(() => {
      if (open) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'unset'
      }

      return () => {
        document.body.style.overflow = 'unset'
      }
    }, [open])

    const slideDirection = side === 'right' ? { x: '100%' } : { x: '-100%' }

    return (
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              ref={ref}
              initial={slideDirection}
              animate={{ x: 0 }}
              exit={slideDirection}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={cn(
                'fixed top-0 bottom-0 z-50 flex w-full flex-col bg-white shadow-xl',
                side === 'right' ? 'right-0' : 'left-0',
                drawerSizes[size],
                className
              )}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-start justify-between border-b border-neutral-200 p-6">
                  <div className="flex-1">
                    {title && (
                      <h2 className="text-xl font-semibold text-neutral-900">{title}</h2>
                    )}
                    {description && (
                      <p className="mt-1 text-sm text-neutral-600">{description}</p>
                    )}
                  </div>

                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className={cn(
                        'ml-4 rounded-lg p-1 text-neutral-400 transition-colors',
                        'hover:bg-neutral-100 hover:text-neutral-600',
                        'focus:outline-none focus:ring-2 focus:ring-red/20'
                      )}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">{children}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    )
  }
)

Drawer.displayName = 'Drawer'

export const DrawerFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-end gap-3 border-t border-neutral-200 p-6', className)}
      {...props}
    />
  )
)
DrawerFooter.displayName = 'DrawerFooter'
