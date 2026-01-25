import { Toaster as SonnerToaster } from 'sonner'

export const Toaster = () => {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast: 'bg-white border border-neutral-200 shadow-lg',
          title: 'text-sm font-semibold text-neutral-900',
          description: 'text-sm text-neutral-600',
          actionButton: 'bg-red text-white hover:bg-red700',
          cancelButton: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
          closeButton: 'bg-white border border-neutral-200 hover:bg-neutral-50',
          success: 'border-green-200 bg-green-50',
          error: 'border-red-200 bg-red-50',
          warning: 'border-yellow-200 bg-yellow-50',
          info: 'border-blue-200 bg-blue-50',
        },
      }}
      richColors
    />
  )
}
