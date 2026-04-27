import { useEffect } from 'react'
import { useStockStore } from '../../stores/stockStore'

const AUTO_DISMISS_MS = 5500

function LowStockToastItem({
  id,
  skuCode,
  warehouseName,
  quantity,
}: {
  id: string
  skuCode: string
  warehouseName: string
  quantity: number
}) {
  const removeLowStockAlert = useStockStore((s) => s.removeLowStockAlert)

  useEffect(() => {
    const t = window.setTimeout(() => removeLowStockAlert(id), AUTO_DISMISS_MS)
    return () => window.clearTimeout(t)
  }, [id, removeLowStockAlert])

  return (
    <div
      role="status"
      className="pointer-events-auto w-[min(100vw-2rem,20rem)] rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-lg ring-1 ring-black/5"
    >
      <p className="font-semibold text-amber-900">저재고 알림</p>
      <p className="mt-1 text-amber-900/90">
        <span className="font-mono text-xs">{skuCode}</span>
        <span className="mx-1 text-amber-700">·</span>
        {warehouseName}
      </p>
      <p className="mt-1 tabular-nums text-amber-800">
        수량 <span className="font-semibold">{quantity}</span>
      </p>
    </div>
  )
}

/** `lowStockAlerts`를 우측 하단 토스트로 표시합니다. */
export default function LowStockToaster() {
  const lowStockAlerts = useStockStore((s) => s.lowStockAlerts)

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex max-h-[calc(100vh-2rem)] flex-col-reverse gap-2 overflow-y-auto"
      aria-live="polite"
    >
      {lowStockAlerts.map((a) => (
        <LowStockToastItem
          key={a.id}
          id={a.id}
          skuCode={a.skuCode}
          warehouseName={a.warehouseName}
          quantity={a.quantity}
        />
      ))}
    </div>
  )
}
