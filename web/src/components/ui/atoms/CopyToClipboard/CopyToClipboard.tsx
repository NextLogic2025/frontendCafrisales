import React from 'react'
import { Check, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/utils'

export interface CopyToClipboardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string
  successMessage?: string
  showIcon?: boolean
}

export const CopyToClipboard = React.forwardRef<HTMLButtonElement, CopyToClipboardProps>(
  (
    { text, successMessage = 'Copiado al portapapeles', showIcon = true, className, children, ...props },
    ref
  ) => {
    const [copied, setCopied] = React.useState(false)

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        toast.success(successMessage)

        setTimeout(() => {
          setCopied(false)
        }, 2000)
      } catch (err) {
        toast.error('Error al copiar')
      }
    }

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleCopy}
        className={cn(
          'inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium',
          'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-red/20',
          className
        )}
        {...props}
      >
        {children}
        {showIcon && (copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />)}
      </button>
    )
  }
)

CopyToClipboard.displayName = 'CopyToClipboard'
