import type { ButtonHTMLAttributes } from 'react'

type PrimaryButtonProps = {
  title: string
  loading?: boolean
} & ButtonHTMLAttributes<HTMLButtonElement>

export function PrimaryButton({
  title,
  loading,
  type = 'button',
  disabled,
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      className="flex w-full items-center justify-center gap-3 rounded-xl bg-red px-5 py-3.5 text-base font-semibold text-white shadow-lg shadow-red/25 transition-all duration-200 hover:bg-red700 hover:shadow-xl hover:shadow-red700/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none"
      {...props}
      disabled={loading || disabled}
    >
      {loading ? (
        <>
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Verificando...
        </>
      ) : (
        title
      )}
    </button>
  )
}
