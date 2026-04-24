import type { ReactNode } from 'react'

type Props = {
  title: string
  description?: string
  children: ReactNode
  headerRight?: ReactNode
}

export default function SectionCard({ title, description, children, headerRight }: Props) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs text-slate-500">{description}</p>
          ) : null}
        </div>
        {headerRight ? <div className="shrink-0">{headerRight}</div> : null}
      </div>
      <div className="p-4">{children}</div>
    </section>
  )
}
