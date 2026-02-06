import React from 'react'

type Tone = 'red' | 'gold' | 'green' | 'blue' | 'neutral'

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  tone = 'red',
  onClick,
  loading = false,
}: {
  title: string
  value: string
  subtitle?: string
  icon: React.ReactNode
  tone?: Tone
  onClick?: () => void
  loading?: boolean
}) {
  const palettes: Record<Tone, { bg: string; text: string }> = {
    red: { bg: 'bg-red-50', text: 'text-brand-red' },
    gold: { bg: 'bg-amber-50', text: 'text-amber-700' },
    green: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
    blue: { bg: 'bg-sky-50', text: 'text-sky-700' },
    neutral: { bg: 'bg-gray-50', text: 'text-gray-700' },
  }
  const palette = palettes[tone]

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`flex flex-col gap-1 rounded-2xl border border-neutral-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${loading ? 'opacity-70' : ''}`}
    >
      <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${palette.bg} ${palette.text}`}>
        {loading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : icon}
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">{title}</p>
      {loading ? (
        <div className="h-8 w-24 animate-pulse rounded bg-neutral-100" />
      ) : (
        <p className="text-2xl font-bold text-neutral-900">{value}</p>
      )}
      {subtitle && !loading ? <p className="text-xs text-neutral-500">{subtitle}</p> : null}
      {loading && <div className="h-3 w-32 animate-pulse rounded bg-neutral-50" />}
    </button>
  )
}

export function SectionCard({
  title,
  children,
  actionLabel,
  onAction,
}: {
  title: string
  children: React.ReactNode
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="flex h-full flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-neutral-800">{title}</h3>
        {actionLabel && onAction ? (
          <button
            type="button"
            className="text-xs font-semibold text-brand-red underline-offset-2 hover:underline"
            onClick={onAction}
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
      {children}
    </div>
  )
}

export function QuickActionButton({
  label,
  icon,
  onClick,
}: {
  label: string
  icon: React.ReactNode
  onClick: React.MouseEventHandler<HTMLButtonElement>
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-800 transition hover:-translate-y-0.5 hover:border-brand-red hover:bg-brand-red/5"
    >
      <span className="text-brand-red">{icon}</span>
      {label}
    </button>
  )
}

export function EmptyState({ text }: { text: string }) {
  return <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-500">{text}</p>
}