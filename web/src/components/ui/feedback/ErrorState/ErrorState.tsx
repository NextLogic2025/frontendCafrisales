import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '../../atoms/Button'
import { cn } from '@/utils'

export interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

export const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  (
    {
      title = 'Algo salió mal',
      message = 'Ocurrió un error inesperado. Por favor, intenta nuevamente.',
      onRetry,
      retryLabel = 'Reintentar',
      className,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col items-center justify-center p-12 text-center', className)}
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>

        <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
        <p className="mt-2 max-w-sm text-sm text-neutral-600">{message}</p>

        {onRetry && (
          <Button
            variant="primary"
            onClick={onRetry}
            leftIcon={<RefreshCw className="h-4 w-4" />}
            className="mt-6"
          >
            {retryLabel}
          </Button>
        )}
      </div>
    )
  }
)

ErrorState.displayName = 'ErrorState'
