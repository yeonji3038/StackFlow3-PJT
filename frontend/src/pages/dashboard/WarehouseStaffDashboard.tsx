import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { allocationStatusLabel } from '../../lib/allocationLabels'
import { resolveDefaultWarehouseId } from '../../lib/warehouseContext'
import StatCard from '../../components/ui/StatCard'
import SectionCard from '../../components/ui/SectionCard'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import type { Allocation, WarehouseStock } from '../../types/models'

export default function WarehouseStaffDashboard() {
  const [warehouseId, setWarehouseId] = useState<number | null>(null)
  const [allocations, setAllocations] = useState<Allocation[]>([])
  const [stocks, setStocks] = useState<WarehouseStock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const wid = await resolveDefaultWarehouseId()
        if (cancelled) return
        setWarehouseId(wid)

        const [allocRes, stocksRes] = await Promise.all([
          api.get<Allocation[]>('/api/allocations'),
          wid != null
            ? api.get<WarehouseStock[]>(`/api/warehouses/${wid}/stocks`)
            : Promise.resolve({ data: [] as WarehouseStock[] }),
        ])
        if (cancelled) return
        const all = allocRes.data ?? []
        const scoped = wid != null ? all.filter((a) => a.warehouseId === wid) : all
        setAllocations(scoped)
        setStocks(stocksRes.data ?? [])
      } catch {
        if (!cancelled) setError('데이터를 불러오지 못했습니다.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const outboundPending = useMemo(
    () =>
      allocations.filter(
        (a) => a.status === 'APPROVED' || a.status === 'REQUESTED',
      ),
    [allocations],
  )

  const lowWarehouse = useMemo(
    () => stocks.filter((s) => s.quantity <= 10).sort((a, b) => a.quantity - b.quantity).slice(0, 10),
    [stocks],
  )

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <p className="text-sm text-rose-600">{error}</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">창고 대시보드</h1>
        <p className="mt-1 text-sm text-slate-500">
          {warehouseId != null
            ? `창고 ID ${warehouseId} 기준 배분·재고`
            : '담당 창고가 지정되지 않아 전체 창고의 배분을 표시합니다.'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="출고 대기"
          value={outboundPending.length}
          hint="요청·승인 상태"
          tone="amber"
        />
        <StatCard title="담당 배분" value={allocations.length} hint="이 창고 관련" />
        <StatCard
          title="저재고 SKU"
          value={lowWarehouse.length}
          hint="수량 10 이하"
          tone={lowWarehouse.length ? 'rose' : 'default'}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="출고 대기 목록"
          description="승인되었거나 요청된 배분부터 처리하세요."
          headerRight={
            <Link
              to="/allocations"
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              배분 관리
            </Link>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-2 py-2">번호</th>
                  <th className="px-2 py-2">매장</th>
                  <th className="px-2 py-2">상태</th>
                  <th className="px-2 py-2">품목 수</th>
                </tr>
              </thead>
              <tbody>
                {outboundPending.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-2 py-8 text-center text-slate-400">
                      출고 대기 건이 없습니다.
                    </td>
                  </tr>
                ) : (
                  outboundPending.slice(0, 12).map((a) => (
                    <tr
                      key={a.id}
                      className="border-b border-slate-100 even:bg-slate-50/50 hover:bg-blue-50/40"
                    >
                      <td className="px-2 py-2 font-mono text-xs text-slate-600">{a.id}</td>
                      <td className="px-2 py-2 text-slate-800">{a.storeName}</td>
                      <td className="px-2 py-2">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                          {allocationStatusLabel(a.status)}
                        </span>
                      </td>
                      <td className="px-2 py-2 tabular-nums text-slate-700">{a.items?.length ?? 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard
          title="창고 재고 현황"
          description="수량이 낮은 옵션입니다."
          headerRight={
            <Link
              to="/warehouse-stock"
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              재고 상세
            </Link>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-2 py-2">SKU</th>
                  <th className="px-2 py-2">상품</th>
                  <th className="px-2 py-2 text-right">수량</th>
                </tr>
              </thead>
              <tbody>
                {warehouseId == null ? (
                  <tr>
                    <td colSpan={3} className="px-2 py-6 text-center text-slate-400">
                      창고를 특정할 수 없습니다. 창고 목록의 첫 창고를 사용합니다.
                    </td>
                  </tr>
                ) : lowWarehouse.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-2 py-6 text-center text-slate-400">
                      저재고 품목이 없습니다.
                    </td>
                  </tr>
                ) : (
                  lowWarehouse.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-slate-100 even:bg-slate-50/50 hover:bg-blue-50/40"
                    >
                      <td className="px-2 py-2 font-mono text-xs text-slate-600">{s.skuCode}</td>
                      <td className="px-2 py-2 text-slate-800">
                        {s.productName}
                        <span className="text-slate-400">
                          {' '}
                          / {s.color} / {s.size}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-right font-medium tabular-nums text-rose-700">
                        {s.quantity}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
