import { Spinner } from '@heroui/react'

type Props = {
  label?: string
}

export default function LoadingSpinner({ label = '불러오는 중…' }: Props) {
  return (
    <div className="flex h-40 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="xl" />
        <span className="text-sm text-slate-500">{label}</span>
      </div>
    </div>
  )
}

