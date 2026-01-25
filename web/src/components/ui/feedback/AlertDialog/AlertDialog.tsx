import React from 'react'
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../../atoms/Button'
import { cn } from '@/utils'

export interface AlertDialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  variant?: 'default' | 'danger' | 'warning' | 'success' | 'info'
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  onCancel?: () => void
  loading?: boolean
}

const variantConfig = {
  default: {
    icon: Info,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
  },
  danger: {
    icon: AlertCircle,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-100',
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
  },
}

export const AlertDialog = React.forwardRef<HTMLDivElement, AlertDialogProps>(
  (
    {
      open,
      onClose,
      title,
      description,
      variant = 'default',
      confirmLabel = 'Confirmar',
      cancelLabel = 'Cancelar',
      onConfirm,
      onCancel,
      loading = false,
    },
    ref
  ) => {
    const config = variantConfig[variant]
    const Icon = config.icon

    const handleConfirm = () => {
      onConfirm?.()
      if (!loading) {
        onClose()
      }
    }

    const handleCancel = () => {
      onCancel?.()
      onClose()
    }

    // Close on Escape key
    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && open && !loading) {
          handleCancel()
        }
      }

      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }, [open, loading])

    // Prevent body scroll when alert is open
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
              onClick={!loading ? handleCancel : undefined}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />

            {/* Alert Dialog */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                ref={ref}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
              >
                <div className="flex flex-col items-center gap-4 text-center">
                  {/* Icon */}
                  <div className={cn('flex h-16 w-16 items-center justify-center rounded-full', config.iconBg)}>
                    <Icon className={cn('h-8 w-8', config.iconColor)} />
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
                    {description && <p className="text-sm text-neutral-600">{description}</p>}
                  </div>

                  {/* Actions */}
                  <div className="flex w-full gap-3">
                    {onCancel !== undefined && (
                      <Button
                        variant="ghost"
                        onClick={handleCancel}
                        disabled={loading}
                        className="flex-1"
                      >
                        {cancelLabel}
                      </Button>
                    )}
                    <Button
                      variant={variant === 'danger' ? 'danger' : 'primary'}
                      onClick={handleConfirm}
                      loading={loading}
                      className="flex-1"
                    >
                      {confirmLabel}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    )
  }
)

AlertDialog.displayName = 'AlertDialog'
