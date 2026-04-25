import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { api } from '../../lib/api'
import { allocationStatusLabel } from '../../lib/allocationLabels'
import { orderStatusDisplayText } from '../../lib/orderLabels'
import StatCard from '../../components/ui/StatCard'
import SectionCard from '../../components/ui/SectionCard'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import type { Allocation, Order, WarehouseStock, WarehouseSummary } from '../../types/models'
import { useStockStore } from '../../stores/stockStore'

const LOW_STOCK_MAX = 10

const ALLOCATION_STATUS_ORDER = [
  'REQUESTED',
  'APPROVED',
  'SHIPPED',
  'RECEIVED',
  'CANCELLED',
] as const

function lowStockBarColor(quantity: number, minQ: number, maxQ: number): string {
  const t = maxQ === minQ ? 1 : (maxQ - quantity) / (maxQ - minQ)
  const r1 = 254
  const g1 = 202
  const b1 = 202
  const r2 = 185
  const g2 = 28
  const b2 = 28
  const r = Math.round(r1 + (r2 - r1) * t)
  const g = Math.round(g1 + (g2 - g1) * t)
  const b = Math.round(b1 + (b2 - b1) * t)
  return `rgb(${r},${g},${b})`
}

export default function HQDashboard() {
  const navigate = useNavigate()
  const dashboardRefreshTrigger = useStockStore((s) => s.dashboardRefreshTrigger)
  const hasFetchedOnce = useRef(false)
  const [allocations, setAllocations] = useState<Allocation[]>([])
  const [lowStock, setLowStock] = useState<WarehouseStock[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [orderCount, setOrderCount] = useState<number | null>(null)
  const [ordersUnavailable, setOrdersUnavailable] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const silent = hasFetchedOnce.current && dashboardRefreshTrigger > 0
    ;(async () => {
      if (!silent) {
        setLoading(true)
        setError(null)
      }
      try {
        const [allocRes, whRes] = await Promise.all([
          api.get<Allocation[]>('/api/allocations'),
          api.get<WarehouseSummary[]>('/api/warehouses'),
        ])
        if (cancelled) return
        setAllocations(allocRes.data ?? [])

        const warehouses = whRes.data ?? []
        const stockLists = await Promise.all(
          warehouses.map((w) =>
            api
              .get<WarehouseStock[]>(`/api/warehouses/${w.id}/stocks`)
              .then((r) => r.data ?? [])
              .catch(() => [] as WarehouseStock[]),
          ),
        )
        if (cancelled) return
        const merged = stockLists.flat()
        const low = merged
          .filter((s) => s.quantity <= LOW_STOCK_MAX)
          .sort((a, b) => a.quantity - b.quantity)
          .slice(0, 12)
        setLowStock(low)

        try {
          const ord = await api.get<Order[]>('/api/orders')
          const list = Array.isArray(ord.data) ? ord.data : []
          if (!cancelled) {
            setOrders(list)
            setOrderCount(list.length)
            setOrdersUnavailable(false)
          }
        } catch {
          if (!cancelled) {
            setOrders([])
            setOrdersUnavailable(true)
            setOrderCount(null)
          }
        }
      } catch {
        if (!cancelled) setError('데이터를 불러오지 못했습니다.')
      } finally {
        if (!cancelled) {
          if (!silent) setLoading(false)
          hasFetchedOnce.current = true
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [dashboardRefreshTrigger])

  const statusSummary = useMemo(() => {
    const map = new Map<string, number>()
    for (const a of allocations) {
      map.set(a.status, (map.get(a.status) ?? 0) + 1)
    }
    return map
  }, [allocations])

  const statusChartData = useMemo(
    () =>
      ALLOCATION_STATUS_ORDER.map((status) => ({
        status,
        label: allocationStatusLabel(status),
        count: statusSummary.get(status) ?? 0,
      })),
    [statusSummary],
  )

  const lowStockChartData = useMemo(() => {
    const skuCounts = new Map<string, number>()
    for (const s of lowStock) {
      skuCounts.set(s.skuCode, (skuCounts.get(s.skuCode) ?? 0) + 1)
    }
    return lowStock.map((s) => ({
      skuCode: s.skuCode,
      quantity: s.quantity,
      xLabel: (skuCounts.get(s.skuCode) ?? 0) > 1 ? `${s.skuCode} (${s.warehouseName})` : s.skuCode,
    }))
  }, [lowStock])

  const lowStockQtyRange = useMemo(() => {
    if (lowStockChartData.length === 0) return { minQ: 0, maxQ: 0 }
    const qs = lowStockChartData.map((d) => d.quantity)
    return { minQ: Math.min(...qs), maxQ: Math.max(...qs) }
  }, [lowStockChartData])

  const pendingAllocations = useMemo(
    () =>
      allocations.filter((a) => a.status === 'REQUESTED' || a.status === 'APPROVED').slice(0, 8),
    [allocations],
  )

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => {
          const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return tb - ta
        })
        .slice(0, 5),
    [orders],
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
        <h1 className="text-lg font-semibold text-slate-900">본사 대시보드</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="배분 건수"
          value={allocations.length}
          hint="전체 배분 요청"
          onClick={() => navigate('/allocations')}
        />
        <StatCard
          title="처리 대기"
          value={(statusSummary.get('REQUESTED') ?? 0) + (statusSummary.get('APPROVED') ?? 0)}
          hint="요청 + 승인"
          tone="amber"
          onClick={() => navigate('/allocations?status=REQUESTED,APPROVED')}
        />
        <StatCard
          title="발주 건수"
          value={ordersUnavailable ? '—' : (orderCount ?? 0)}
          hint={ordersUnavailable ? '데이터를 불러올 수 없음' : '등록된 발주'}
          onClick={() => navigate('/orders')}
        />
        <StatCard
          title="저재고 SKU"
          value={lowStock.length}
          hint={`창고별 수량 ${LOW_STOCK_MAX} 이하`}
          tone={lowStock.length ? 'rose' : 'default'}
          onClick={() => navigate('/warehouse-stock')}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="배분 현황"
          headerRight={
            <Link
              to="/allocations"
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              전체 보기
            </Link>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-2 py-2">번호</th>
                  <th className="px-2 py-2">창고</th>
                  <th className="px-2 py-2">매장</th>
                  <th className="px-2 py-2">상태</th>
                </tr>
              </thead>
              <tbody>
                {pendingAllocations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-2 py-8 text-center text-slate-400">
                      대기 중인 배분이 없습니다.
                    </td>
                  </tr>
                ) : (
                  pendingAllocations.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b border-slate-100 even:bg-slate-50/50 hover:bg-blue-50/40"
                    >
                      <td className="px-2 py-2 font-mono text-xs text-slate-600">{a.id}</td>
                      <td className="px-2 py-2 text-slate-800">{a.warehouseName}</td>
                      <td className="px-2 py-2 text-slate-800">{a.storeName}</td>
                      <td className="px-2 py-2">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                          {allocationStatusLabel(a.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard
          title="창고 재고 부족 알림"
          headerRight={
            <Link
              to="/warehouse-stock"
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              전체 보기
            </Link>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-2 py-2">창고</th>
                  <th className="px-2 py-2">SKU</th>
                  <th className="px-2 py-2">상품</th>
                  <th className="px-2 py-2 text-right">수량</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-2 py-8 text-center text-slate-400">
                      부족 재고가 없습니다.
                    </td>
                  </tr>
                ) : (
                  lowStock.map((s) => (
                    <tr
                      key={`${s.warehouseId}-${s.id}`}
                      className="border-b border-slate-100 even:bg-slate-50/50 hover:bg-blue-50/40"
                    >
                      <td className="px-2 py-2 text-slate-700">{s.warehouseName}</td>
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

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="배분 상태별 현황">
          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <XAxis dataKey="label" tick={{ fontSize: 12 }} interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={36} />
                <Tooltip
                  formatter={(value) => [`${typeof value === 'number' ? value : 0}건`, '건수']}
                  labelFormatter={(label) => String(label ?? '')}
                />
                <Bar dataKey="count" name="건수" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="저재고 SKU 수량">
          {lowStockChartData.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">표시할 저재고 SKU가 없습니다.</p>
          ) : (
            <div className="h-64 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lowStockChartData} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
                  <XAxis
                    dataKey="xLabel"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-32}
                    textAnchor="end"
                    height={56}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={36} />
                  <Tooltip
                    formatter={(value) => [typeof value === 'number' ? value : 0, '수량']}
                    labelFormatter={(label) => `SKU: ${label}`}
                  />
                  <Bar dataKey="quantity" name="수량" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {lowStockChartData.map((entry, index) => (
                      <Cell
                        key={`${entry.xLabel}-${index}`}
                        fill={lowStockBarColor(entry.quantity, lowStockQtyRange.minQ, lowStockQtyRange.maxQ)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="발주 현황"
        headerRight={
          <Link to="/orders" className="text-xs font-medium text-blue-600 hover:text-blue-700">
            전체 보기
          </Link>
        }
      >
        {ordersUnavailable ? (
          <p className="text-sm text-slate-500">
            발주 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-2 py-2">ID</th>
                  <th className="px-2 py-2">매장</th>
                  <th className="px-2 py-2">상태</th>
                  <th className="px-2 py-2">요청자</th>
                  <th className="px-2 py-2">승인자</th>
                  <th className="px-2 py-2">등록일</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-2 py-8 text-center text-slate-400">
                      등록된 발주가 없습니다.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((o) => (
                    <tr
                      key={o.id}
                      className="border-b border-slate-100 even:bg-slate-50/50 hover:bg-blue-50/40"
                    >
                      <td className="px-2 py-2 font-mono text-xs text-slate-600">{o.id}</td>
                      <td className="px-2 py-2 text-slate-800">{o.storeName}</td>
                      <td className="px-2 py-2">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                          {orderStatusDisplayText(o)}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-slate-800">{o.requestedByName ?? '—'}</td>
                      <td className="px-2 py-2 text-slate-800">{o.approvedByName ?? '—'}</td>
                      <td className="px-2 py-2 text-xs text-slate-600">
                        {o.createdAt ? new Date(o.createdAt).toLocaleString('ko-KR') : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  )
}
