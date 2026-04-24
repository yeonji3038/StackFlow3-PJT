import type { ReactNode } from 'react'

type Props = {
  title: string
  description?: string
  open: boolean
  onClose: () => void
  children: ReactNode
}

export default function Modal({ title, description, open, onClose, children }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="relative mx-auto flex h-full max-w-2xl items-center px-4">
        <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
              {description ? (
                <p className="mt-1 text-xs text-slate-500">{description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              닫기
            </button>
          </div>
          <div className="max-h-[70vh] overflow-auto px-5 py-4">{children}</div>
        </div>
      </div>
    </div>
  )
}

