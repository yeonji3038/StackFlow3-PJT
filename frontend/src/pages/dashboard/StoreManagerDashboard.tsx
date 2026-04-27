import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { getStoreId } from '../../lib/auth'
import StatCard from '../../components/ui/StatCard'
import SectionCard from '../../components/ui/SectionCard'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import type { Order, StoreStock, StoreStockHistory } from '../../types/models'

function formatHistoryDate(iso: string | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('ko-KR')
}

function historyInOutLabel(row: StoreStockHistory): string {
  if (row.typeDescription) return row.typeDescription
  const t = row.type
  if (t === 'IN') return '입고'
  if (t === 'OUT') return '출고'
  return t
}

export default function StoreManagerDashboard() {
  const navigate = useNavigate()
  const storeId = getStoreId()
  const [stocks, setStocks] = useState<StoreStock[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [history, setHistory] = useState<StoreStockHistory[]>([])
  const [ordersUnavailable, setOrdersUnavailable] = useState(false)
  const [historyUnavailable, setHistoryUnavailable] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        let stocksData: StoreStock[] = []
        if (storeId != null) {
          try {
            const st = await api.get<StoreStock[]>(`/api/stores/${storeId}/stocks`)
            stocksData = Array.isArray(st.data) ? st.data : []
          } catch {
            stocksData = []
          }
        }
        if (cancelled) return
        setStocks(stocksData)

        let ordList: Order[] = []
        let ordFail = false
        try {
          const ordRes = await api.get<Order[]>('/api/orders')
          ordList = Array.isArray(ordRes.data) ? ordRes.data : []
        } catch {
          ordFail = true
          ordList = []
        }
        if (cancelled) return
        setOrders(ordList)
        setOrdersUnavailable(ordFail)

        let hList: StoreStockHistory[] = []
        let histFail = false
        if (storeId != null) {
          try {
            const hiRes = await api.get<StoreStockHistory[]>(`/api/stock-history/store/${storeId}`)
            hList = Array.isArray(hiRes.data) ? hiRes.data : []
          } catch {
            histFail = true
            hList = []
          }
        }
        if (cancelled) return
        setHistory(hList)
        setHistoryUnavailable(histFail)
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

  const myOrders = useMemo(() => {
    if (storeId == null) return orders
    return orders.filter((o) => o.storeId === storeId)
  }, [orders, storeId])

  const orderTotal = myOrders.length

  const statusCounts = useMemo(() => {
    const c = { REQUESTED: 0, APPROVED: 0, SHIPPED: 0, RECEIVED: 0 }
    for (const o of myOrders) {
      if (o.status === 'REQUESTED') c.REQUESTED += 1
      else if (o.status === 'APPROVED') c.APPROVED += 1
      else if (o.status === 'SHIPPED') c.SHIPPED += 1
      else if (o.status === 'RECEIVED') c.RECEIVED += 1
    }
    return c
  }, [myOrders])

  const lowStoreStock = useMemo(
    () => stocks.filter((s) => s.quantity <= 5).sort((a, b) => a.quantity - b.quantity).slice(0, 10),
    [stocks],
  )

  const recentHistory = useMemo(() => {
    return [...history]
      .sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return tb - ta
      })
      .slice(0, 5)
  }, [history])

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

      <div className="w-full max-w-sm">
        <StatCard
          title="발주"
          value={ordersUnavailable ? '—' : orderTotal}
          hint={ordersUnavailable ? '데이터를 불러올 수 없음' : '전체 발주 건수'}
          onClick={() => navigate('/orders')}
        />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-800">발주 상태 현황</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="요청"
            value={ordersUnavailable ? '—' : statusCounts.REQUESTED}
            hint="REQUESTED"
            onClick={() => navigate('/orders?status=REQUESTED')}
          />
          <StatCard
            title="승인"
            value={ordersUnavailable ? '—' : statusCounts.APPROVED}
            hint="APPROVED"
            onClick={() => navigate('/orders?status=APPROVED')}
          />
          <StatCard
            title="출고"
            value={ordersUnavailable ? '—' : statusCounts.SHIPPED}
            hint="SHIPPED"
            onClick={() => navigate('/orders?status=SHIPPED')}
          />
          <StatCard
            title="입고완료"
            value={ordersUnavailable ? '—' : statusCounts.RECEIVED}
            hint="RECEIVED"
            onClick={() => navigate('/orders?status=RECEIVED')}
          />
        </div>
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
              발주 <span className="font-semibold tabular-nums">{orderTotal}</span>건
            </p>
          )}
        </SectionCard>

        <div
          role="button"
          tabIndex={0}
          onClick={() => navigate('/store-stock')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              navigate('/store-stock')
            }
          }}
          className="cursor-pointer rounded-xl transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
        >
          <SectionCard
            title="매장 재고 현황"
            description="수량이 낮은 옵션을 강조합니다. 카드를 누르면 매장 재고 페이지로 이동합니다."
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
      </div>

      <SectionCard
        title="최근 입출고 이력"
        description="매장 기준 최근 5건입니다."
        headerRight={
          <Link to="/movements" className="text-xs font-medium text-blue-600 hover:text-blue-700">
            전체 보기
          </Link>
        }
      >
        {!storeId ? (
          <p className="text-sm text-slate-500">매장 ID가 없어 이력을 불러올 수 없습니다.</p>
        ) : historyUnavailable ? (
          <p className="text-sm text-slate-500">입출고 이력을 불러오지 못했습니다.</p>
        ) : recentHistory.length === 0 ? (
          <p className="text-sm text-slate-500">표시할 이력이 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-2 py-2">날짜</th>
                  <th className="px-2 py-2">SKU</th>
                  <th className="px-2 py-2">상품명</th>
                  <th className="px-2 py-2">입고/출고</th>
                  <th className="px-2 py-2 text-right">수량</th>
                </tr>
              </thead>
              <tbody>
                {recentHistory.map((h) => (
                  <tr key={h.id} className="border-b border-slate-100 even:bg-slate-50/50">
                    <td className="px-2 py-2 text-xs text-slate-600">{formatHistoryDate(h.createdAt)}</td>
                    <td className="px-2 py-2 font-mono text-xs text-slate-700">{h.skuCode}</td>
                    <td className="px-2 py-2 text-slate-800">{h.productName}</td>
                    <td className="px-2 py-2 text-slate-700">{historyInOutLabel(h)}</td>
                    <td className="px-2 py-2 text-right font-medium tabular-nums text-slate-900">
                      {h.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  )
}
