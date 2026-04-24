type Props = {
  title: string
  value: string | number
  hint?: string
  tone?: 'default' | 'amber' | 'rose'
  onClick?: () => void
}

const toneClass: Record<NonNullable<Props['tone']>, string> = {
  default: 'border-slate-200 bg-white',
  amber: 'border-amber-200/80 bg-amber-50/60',
  rose: 'border-rose-200/80 bg-rose-50/60',
}

const interactiveClass =
  'cursor-pointer text-left transition hover:border-slate-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50'

export default function StatCard({ title, value, hint, tone = 'default', onClick }: Props) {
  const cls = `rounded-xl border p-4 shadow-sm ${toneClass[tone]}${onClick ? ` ${interactiveClass}` : ''}`

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`block w-full ${cls}`}>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
        <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
        {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
      </button>
    )
  }

  return (
    <div className={cls}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  )
}
