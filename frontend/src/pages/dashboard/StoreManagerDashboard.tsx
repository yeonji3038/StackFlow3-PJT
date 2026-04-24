import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { getStoreId } from '../../lib/auth'
import { allocationStatusLabel } from '../../lib/allocationLabels'
import StatCard from '../../components/ui/StatCard'
import SectionCard from '../../components/ui/SectionCard'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import type { Allocation, StoreStock } from '../../types/models'

export default function StoreManagerDashboard() {
  const storeId = getStoreId()
  const [allocations, setAllocations] = useState<Allocation[]>([])
  const [stocks, setStocks] = useState<StoreStock[]>([])
  const [orderCount, setOrderCount] = useState<number | null>(null)
  const [ordersUnavailable, setOrdersUnavailable] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const allocRes = await api.get<Allocation[]>('/api/allocations')
        if (cancelled) return
        const mine = storeId
          ? allocRes.data.filter((a) => a.storeId === storeId)
          : allocRes.data
        setAllocations(mine)

        if (storeId) {
          try {
            const st = await api.get<StoreStock[]>(`/api/stores/${storeId}/stocks`)
            if (!cancelled) setStocks(st.data ?? [])
          } catch {
            if (!cancelled) setStocks([])
          }
        } else {
          setStocks([])
        }

        try {
          const ord = await api.get<unknown[]>('/api/orders')
          if (!cancelled) {
            const list = Array.isArray(ord.data) ? ord.data : []
            if (storeId) {
              setOrderCount(
                list.filter((o: unknown) => {
                  if (o && typeof o === 'object' && 'storeId' in o) {
                    return (o as { storeId: number }).storeId === storeId
                  }
                  return true
                }).length,
              )
            } else {
              setOrderCount(list.length)
            }
          }
        } catch {
          if (!cancelled) {
            setOrdersUnavailable(true)
            setOrderCount(null)
          }
        }
      } catch {
        if (!cancelled) setError('데이터를 불러오지 못했습니다.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [storeId])

  const lowStoreStock = useMemo(
    () => stocks.filter((s) => s.quantity <= 5).sort((a, b) => a.quantity - b.quantity).slice(0, 10),
    [stocks],
  )

  const recentAllocations = useMemo(() => allocations.slice(0, 10), [allocations])

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <p className="text-sm text-rose-600">{error}</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">매장 대시보드</h1>
        <p className="mt-1 text-sm text-slate-500">
          {storeId ? `매장 ID ${storeId} 기준` : '로그인에 매장 정보가 없습니다. 본사에 문의하세요.'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="내 매장 배분"
          value={allocations.length}
          hint="연결된 배분 요청"
        />
        <StatCard
          title="저재고 SKU"
          value={lowStoreStock.length}
          hint="수량 5 이하"
          tone={lowStoreStock.length ? 'amber' : 'default'}
        />
        <StatCard
          title="발주"
          value={ordersUnavailable ? '—' : (orderCount ?? 0)}
          hint={ordersUnavailable ? '데이터를 불러올 수 없음' : '발주 건수'}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="내 발주 현황"
          description="최근 발주 건수를 확인합니다."
          headerRight={
            <Link to="/orders" className="text-xs font-medium text-blue-600 hover:text-blue-700">
              발주 관리
            </Link>
          }
        >
          {ordersUnavailable ? (
            <p className="text-sm text-slate-500">
              발주 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
            </p>
          ) : (
            <p className="text-sm text-slate-700">
              발주 <span className="font-semibold tabular-nums">{orderCount ?? 0}</span>건
            </p>
          )}
        </SectionCard>

        <SectionCard
          title="매장 재고 현황"
          description="수량이 낮은 옵션을 강조합니다."
          headerRight={
            <Link
              to="/store-stock"
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
                {!storeId ? (
                  <tr>
                    <td colSpan={3} className="px-2 py-6 text-center text-slate-400">
                      매장 ID가 없어 재고를 불러올 수 없습니다.
                    </td>
                  </tr>
                ) : lowStoreStock.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-2 py-6 text-center text-slate-400">
                      저재고 품목이 없습니다.
                    </td>
                  </tr>
                ) : (
                  lowStoreStock.map((s) => (
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
                      <td className="px-2 py-2 text-right font-medium tabular-nums text-amber-800">
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

      <SectionCard
        title="최근 배분"
        description="매장과 관련된 배분 내역입니다."
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
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-2 py-2">번호</th>
                <th className="px-2 py-2">창고</th>
                <th className="px-2 py-2">상태</th>
                <th className="px-2 py-2">품목 수</th>
              </tr>
            </thead>
            <tbody>
              {recentAllocations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-2 py-8 text-center text-slate-400">
                    배분 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                recentAllocations.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-slate-100 even:bg-slate-50/50 hover:bg-blue-50/40"
                  >
                    <td className="px-2 py-2 font-mono text-xs text-slate-600">{a.id}</td>
                    <td className="px-2 py-2 text-slate-800">{a.warehouseName}</td>
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
    </div>
  )
}
