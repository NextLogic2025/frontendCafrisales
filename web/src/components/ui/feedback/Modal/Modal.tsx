import React from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  className?: string
}

const modalSizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4',
}

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      open,
      onClose,
      title,
      description,
      children,
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

    // Prevent body scroll when modal is open
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

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <motion.div
                ref={ref}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'relative w-full rounded-lg bg-white shadow-xl',
                  modalSizes[size],
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
                <div className="p-6">{children}</div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    )
  }
)

Modal.displayName = 'Modal'

export const ModalFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-end gap-3 border-t border-neutral-200 p-6', className)}
      {...props}
    />
  )
)
ModalFooter.displayName = 'ModalFooter'
