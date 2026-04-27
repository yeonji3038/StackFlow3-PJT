import { useEffect, useMemo, useState } from 'react'
import { Building2, Package, Truck, CheckCircle2 } from 'lucide-react'
import { api } from '../lib/api'
import { allocationStatusLabel } from '../lib/allocationLabels'
import { getRole, getStoreId, getWarehouseId } from '../lib/auth'
import SectionCard from '../components/ui/SectionCard'
import TablePaginationBar from '../components/ui/TablePaginationBar'
import Modal from '../components/ui/Modal'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useTablePagination } from '../hooks/useTablePagination'
import type { Allocation, AllocationItem, StoreStockHistory } from '../types/models'

type MovementStep = {
  id: string
  title: string
  subtitle: string
  time: string
  icon: 'request' | 'move' | 'ship' | 'done'
  status: 'done' | 'current' | 'todo'
}

type MovementCard = {
  id: string
  allocationId: number
  title: string
  subtitle: string
  type: 'IN' | 'OUT'
  sku: string
  product: string
  statusText: string
  statusCode: string
  cancelled: boolean
  createdAt: string
  items: AllocationItem[]
  steps: MovementStep[]
}

type HistoryCard = {
  id: string
  flow: 'IN' | 'OUT' | 'OTHER'
  sku: string
  product: string
  subtitle: string
  statusText: string
  quantity: number
  createdAt: string
  row: StoreStockHistory
}

function formatDateTime(iso: string | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('ko-KR')
}

function historyInOutLabel(row: StoreStockHistory): string {
  if (row.typeDescription) return row.typeDescription
  const t = row.type
  if (t === 'IN') return '입고'
  if (t === 'OUT') return '출고'
  return row.type || '—'
}

function historyFlow(row: StoreStockHistory): HistoryCard['flow'] {
  const t = (row.type ?? '').toUpperCase()
  if (t === 'IN') return 'IN'
  if (t === 'OUT') return 'OUT'
  const desc = (row.typeDescription ?? '').toLowerCase()
  if (desc.includes('입고')) return 'IN'
  if (desc.includes('출고')) return 'OUT'
  return 'OTHER'
}

function stockHistoryToCard(row: StoreStockHistory): HistoryCard {
  const flow = historyFlow(row)
  const typeLabel = historyInOutLabel(row)
  const extra = [row.color, row.size].filter(Boolean).join(' · ')
  return {
    id: `h-${row.id}`,
    flow,
    sku: row.skuCode ?? '—',
    product: row.productName ?? '—',
    subtitle: extra || typeLabel,
    statusText: typeLabel,
    quantity: row.quantity,
    createdAt: row.createdAt,
    row,
  }
}

function buildMovementSteps(a: Allocation): MovementStep[] {
  const st = a.status
  const created = formatDateTime(a.createdAt)
  const updated = formatDateTime(a.updatedAt)

  const defs = [
    {
      id: 's1',
      title: '이동 요청',
      subtitle: '배분 요청이 접수되었습니다.',
      icon: 'request' as const,
    },
    {
      id: 's2',
      title: '상품 이동중',
      subtitle: '승인 후 출고 준비가 진행됩니다.',
      icon: 'move' as const,
    },
    {
      id: 's3',
      title: '출고 완료',
      subtitle: '창고에서 출고 처리되었습니다.',
      icon: 'ship' as const,
    },
    {
      id: 's4',
      title: '입고 완료',
      subtitle: '매장 입고가 완료되었습니다.',
      icon: 'done' as const,
    },
  ]

  if (st === 'CANCELLED') {
    return defs.map((d) => ({
      ...d,
      time: '—',
      status: 'todo' as const,
    }))
  }

  let lastActive = 0
  if (st === 'REQUESTED') lastActive = 0
  else if (st === 'APPROVED') lastActive = 1
  else if (st === 'SHIPPED') lastActive = 2
  else if (st === 'RECEIVED') lastActive = 3
  else lastActive = 0

  return defs.map((d, i) => {
    let stepStatus: MovementStep['status']
    if (st === 'RECEIVED') {
      stepStatus = 'done'
    } else if (i < lastActive) {
      stepStatus = 'done'
    } else if (i === lastActive) {
      stepStatus = 'current'
    } else {
      stepStatus = 'todo'
    }

    let time = '—'
    if (i === 0) time = created
    else if (stepStatus === 'done' || stepStatus === 'current') {
      time = updated !== '—' ? updated : created
    }

    return { ...d, status: stepStatus, time }
  })
}

function allocationToCard(a: Allocation): MovementCard {
  const items = a.items ?? []
  const first = items[0]
  const extra = items.length > 1 ? ` 외 ${items.length - 1}건` : ''
  const sku = first?.skuCode ?? '—'
  const product = first ? `${first.productName}${extra}` : '품목 없음'

  return {
    id: String(a.id),
    allocationId: a.id,
    title: `배분 이동 #${a.id}`,
    subtitle: `${a.warehouseName ?? '—'} → ${a.storeName ?? '—'}`,
    type: a.status === 'RECEIVED' ? 'IN' : 'OUT',
    sku,
    product,
    statusText: allocationStatusLabel(a.status),
    statusCode: a.status,
    cancelled: a.status === 'CANCELLED',
    createdAt: a.createdAt,
    items,
    steps: buildMovementSteps(a),
  }
}

function matchesAllocationMovementType(filter: 'ALL' | 'IN' | 'OUT', status: string): boolean {
  if (filter === 'ALL') return true
  if (filter === 'IN') return status === 'RECEIVED'
  if (filter === 'OUT')
    return status === 'REQUESTED' || status === 'APPROVED' || status === 'SHIPPED'
  return true
}

function matchesHistoryMovementType(filter: 'ALL' | 'IN' | 'OUT', flow: HistoryCard['flow']): boolean {
  if (filter === 'ALL') return true
  if (filter === 'IN') return flow === 'IN'
  if (filter === 'OUT') return flow === 'OUT'
  return true
}

function timelineVisible(steps: MovementStep[]) {
  return steps.filter((s) => s.status === 'done' || s.status === 'current')
}

function StepIcon({ icon, active }: { icon: MovementStep['icon']; active: boolean }) {
  const cls = active ? 'text-blue-700' : 'text-slate-400'
  switch (icon) {
    case 'request':
      return <Building2 className={`h-5 w-5 ${cls}`} aria-hidden />
    case 'move':
      return <Package className={`h-5 w-5 ${cls}`} aria-hidden />
    case 'ship':
      return <Truck className={`h-5 w-5 ${cls}`} aria-hidden />
    case 'done':
      return <CheckCircle2 className={`h-5 w-5 ${cls}`} aria-hidden />
    default:
      return <Package className={`h-5 w-5 ${cls}`} aria-hidden />
  }
}

function overallStepIndex(steps: MovementStep[], cancelled: boolean): number {
  if (cancelled) return -1
  const idx = steps.findLastIndex((s) => s.status === 'done' || s.status === 'current')
  return idx
}

type MovementsMode = 'allocations' | 'store_history' | 'warehouse_history'

export default function MovementsPage() {
  const role = getRole()
  const storeId = getStoreId()
  const warehouseId = getWarehouseId()

  const mode: MovementsMode =
    role === 'STORE_MANAGER'
      ? 'store_history'
      : role === 'WAREHOUSE_STAFF'
        ? 'warehouse_history'
        : 'allocations'

  const [allocations, setAllocations] = useState<Allocation[]>([])
  const [stockHistory, setStockHistory] = useState<StoreStockHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [type, setType] = useState<'ALL' | 'IN' | 'OUT'>('ALL')
  const [selectedAllocationId, setSelectedAllocationId] = useState<string | null>(null)
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      setAllocations([])
      setStockHistory([])

      try {
        if (mode === 'allocations') {
          const { data } = await api.get<Allocation[]>('/api/allocations')
          if (!cancelled) setAllocations(Array.isArray(data) ? data : [])
        } else if (mode === 'store_history') {
          if (storeId == null) {
            if (!cancelled) setError('매장 정보(storeId)가 없어 이력을 불러올 수 없습니다.')
            return
          }
          const { data } = await api.get<StoreStockHistory[]>(`/api/stock-history/store/${storeId}`)
          if (!cancelled) setStockHistory(Array.isArray(data) ? data : [])
        } else {
          if (warehouseId == null) {
            if (!cancelled) setError('창고 정보(warehouseId)가 없어 이력을 불러올 수 없습니다.')
            return
          }
          const { data } = await api.get<StoreStockHistory[]>(
            `/api/stock-history/warehouse/${warehouseId}`,
          )
          if (!cancelled) setStockHistory(Array.isArray(data) ? data : [])
        }
      } catch {
        if (!cancelled) {
          if (mode === 'allocations') setError('배분 목록을 불러오지 못했습니다.')
          else setError('입출고 이력을 불러오지 못했습니다.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [mode, storeId, warehouseId])

  const allocationCards = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return allocations
      .filter((a) => matchesAllocationMovementType(type, a.status))
      .filter((a) => {
        if (!needle) return true
        const itemHay = (a.items ?? [])
          .flatMap((it) => [it.skuCode, it.productName, it.color, it.size])
          .filter(Boolean)
          .join(' ')
        const hay = [
          String(a.id),
          a.warehouseName,
          a.storeName,
          a.status,
          allocationStatusLabel(a.status),
          itemHay,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return hay.includes(needle)
      })
      .map(allocationToCard)
  }, [allocations, q, type])

  const historyCards = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return [...stockHistory]
      .sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return tb - ta
      })
      .map(stockHistoryToCard)
      .filter((c) => matchesHistoryMovementType(type, c.flow))
      .filter((c) => {
        if (!needle) return true
        const hay = [
          String(c.row.id),
          c.sku,
          c.product,
          c.statusText,
          c.row.type,
          String(c.quantity),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return hay.includes(needle)
      })
  }, [stockHistory, q, type])

  const isHistoryMode = mode !== 'allocations'
  const allocationPagination = useTablePagination(allocationCards)
  const historyPagination = useTablePagination(historyCards)
  const listForPagination = isHistoryMode ? historyCards : allocationCards

  const selectedAllocation = useMemo(
    () => (selectedAllocationId ? allocationCards.find((c) => c.id === selectedAllocationId) ?? null : null),
    [allocationCards, selectedAllocationId],
  )

  const selectedHistory = useMemo(
    () =>
      selectedHistoryId != null ? historyCards.find((c) => c.row.id === selectedHistoryId) ?? null : null,
    [historyCards, selectedHistoryId],
  )

  const sectionTitle = mode === 'allocations' ? '배송/이동 조회' : '입출고 이력 조회'
  const searchPlaceholder =
    mode === 'allocations'
      ? '이동 번호, 창고, 매장, SKU, 상품명 검색'
      : 'SKU, 상품명, 구분, 수량 검색'

  const StepperCompact = ({ steps, cancelled }: { steps: MovementStep[]; cancelled: boolean }) => {
    const currentIdx = overallStepIndex(steps, cancelled)
    return (
      <div className="flex items-center gap-2">
        {steps.map((s, idx) => {
          const active = !cancelled && currentIdx >= 0 && idx <= currentIdx
          return (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={[
                  'flex h-7 w-7 items-center justify-center rounded-full border',
                  active ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-slate-50',
                ].join(' ')}
              >
                <StepIcon icon={s.icon} active={active} />
              </div>
              {idx < steps.length - 1 ? (
                <div className={active ? 'h-px w-8 bg-blue-300' : 'h-px w-8 bg-slate-200'} />
              ) : null}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">입출고 이력</h1>
      </div>

      <SectionCard
        title={sectionTitle}
        headerRight={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 w-64 rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <label className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">구분</span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'ALL' | 'IN' | 'OUT')}
                className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">전체</option>
                <option value="OUT">출고</option>
                <option value="IN">입고</option>
              </select>
            </label>
          </div>
        }
      >
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <p className="py-10 text-center text-sm text-rose-600">{error}</p>
        ) : listForPagination.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">조건에 맞는 이동 이력이 없습니다.</p>
        ) : isHistoryMode ? (
          <div>
            <div className="max-h-[min(28rem,calc(100vh-14rem))] overflow-y-auto rounded-md border border-slate-100 px-1 py-1">
              <div className="space-y-3 pr-1">
                {historyPagination.pageItems.map((c) => (
                  <div
                    key={c.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${c.product}, ${c.statusText}. 카드 전체를 눌러 상세를 엽니다.`}
                    onClick={() => setSelectedHistoryId(c.row.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelectedHistoryId(c.row.id)
                      }
                    }}
                    className="w-full cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm outline-none transition hover:border-blue-200 hover:bg-slate-50/60 hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-500/40 active:bg-slate-50/80"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{c.product}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          <span className="font-medium text-slate-700">{c.sku}</span>
                          {c.subtitle && c.subtitle !== c.statusText ? ` · ${c.subtitle}` : null}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          {formatDateTime(c.createdAt)} · 수량{' '}
                          <span className="font-mono text-[11px]">{c.quantity}</span>
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          {c.statusText}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <TablePaginationBar
                page={historyPagination.page}
                pageCount={historyPagination.pageCount}
                total={historyPagination.total}
                setPage={historyPagination.setPage}
                fromIdx={historyPagination.fromIdx}
                toIdx={historyPagination.toIdx}
              />
            </div>
          </div>
        ) : (
          <div>
            <div className="max-h-[min(28rem,calc(100vh-14rem))] overflow-y-auto rounded-md border border-slate-100 px-1 py-1">
              <div className="space-y-3 pr-1">
                {allocationPagination.pageItems.map((c) => (
                  <div
                    key={c.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${c.title}, ${c.statusText}. 카드 전체를 눌러 상세를 엽니다.`}
                    onClick={() => setSelectedAllocationId(c.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelectedAllocationId(c.id)
                      }
                    }}
                    className="w-full cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm outline-none transition hover:border-blue-200 hover:bg-slate-50/60 hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-500/40 active:bg-slate-50/80"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{c.product}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          <span className="font-medium text-slate-700">{c.sku}</span> · {c.subtitle}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          요청 {formatDateTime(c.createdAt)} ·{' '}
                          <span className="font-mono text-[11px]">#{c.allocationId}</span>
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span
                          className={
                            c.cancelled
                              ? 'inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600'
                              : 'inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700'
                          }
                        >
                          {c.cancelled ? '취소' : c.statusText}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <StepperCompact steps={c.steps} cancelled={c.cancelled} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <TablePaginationBar
                page={allocationPagination.page}
                pageCount={allocationPagination.pageCount}
                total={allocationPagination.total}
                setPage={allocationPagination.setPage}
                fromIdx={allocationPagination.fromIdx}
                toIdx={allocationPagination.toIdx}
              />
            </div>
          </div>
        )}
      </SectionCard>

      <Modal
        open={selectedAllocation != null}
        onClose={() => setSelectedAllocationId(null)}
        title={selectedAllocation ? selectedAllocation.product : '상세'}
        description={
          selectedAllocation
            ? `이동 #${selectedAllocation.allocationId} · 요청 ${formatDateTime(selectedAllocation.createdAt)}`
            : undefined
        }
      >
        {selectedAllocation ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{selectedAllocation.title}</p>
                <p className="mt-1 text-xs text-slate-500">{selectedAllocation.subtitle}</p>
                <p className="mt-2 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">{selectedAllocation.sku}</span> ·{' '}
                  {selectedAllocation.product}
                </p>
              </div>
              <span
                className={
                  selectedAllocation.cancelled
                    ? 'rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600'
                    : 'rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700'
                }
              >
                {selectedAllocation.cancelled ? '취소' : selectedAllocation.statusText}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                {selectedAllocation.steps.map((s, idx) => {
                  const active = !selectedAllocation.cancelled && s.status !== 'todo'
                  return (
                    <div key={s.id} className="flex flex-1 items-center gap-2">
                      <div className="flex flex-col items-center">
                        <div
                          className={[
                            'flex h-10 w-10 items-center justify-center rounded-full border',
                            active ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-slate-50',
                          ].join(' ')}
                        >
                          <StepIcon icon={s.icon} active={active} />
                        </div>
                        <p className="mt-2 text-[11px] font-medium text-slate-600">{s.title}</p>
                      </div>
                      {idx < selectedAllocation.steps.length - 1 ? (
                        <div className="h-px flex-1 bg-slate-200" />
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-900">이동 타임라인</h3>
              <div className="mt-3 space-y-3">
                {selectedAllocation.cancelled ? (
                  <p className="py-6 text-center text-sm text-slate-500">
                    취소된 배분입니다. 단계 진행이 중단되었습니다.
                  </p>
                ) : timelineVisible(selectedAllocation.steps).length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-400">
                    아직 기록된 이동 이력이 없습니다.
                  </p>
                ) : (
                  timelineVisible(selectedAllocation.steps)
                    .slice()
                    .reverse()
                    .map((s) => (
                      <div key={s.id} className="flex gap-3">
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50">
                          <CheckCircle2 className="h-4 w-4 text-blue-700" aria-hidden />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900">{s.title}</p>
                          <p className="mt-0.5 text-sm text-slate-600">{s.subtitle}</p>
                          <p className="mt-1 text-xs text-slate-400">{s.time}</p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={selectedHistory != null}
        onClose={() => setSelectedHistoryId(null)}
        title={selectedHistory ? selectedHistory.product : '상세'}
        description={selectedHistory ? formatDateTime(selectedHistory.createdAt) : undefined}
      >
        {selectedHistory ? (
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs font-medium text-slate-500">SKU</dt>
              <dd className="mt-0.5 font-mono text-slate-900">{selectedHistory.sku}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">상품명</dt>
              <dd className="mt-0.5 text-slate-900">{selectedHistory.product}</dd>
            </div>
            {(selectedHistory.row.color || selectedHistory.row.size) && (
              <div>
                <dt className="text-xs font-medium text-slate-500">옵션</dt>
                <dd className="mt-0.5 text-slate-900">
                  {[selectedHistory.row.color, selectedHistory.row.size].filter(Boolean).join(' · ')}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-medium text-slate-500">구분</dt>
              <dd className="mt-0.5 text-slate-900">{selectedHistory.statusText}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">수량</dt>
              <dd className="mt-0.5 font-mono text-slate-900">{selectedHistory.quantity}</dd>
            </div>
            {selectedHistory.row.type && (
              <div>
                <dt className="text-xs font-medium text-slate-500">유형 코드</dt>
                <dd className="mt-0.5 text-slate-900">{selectedHistory.row.type}</dd>
              </div>
            )}
          </dl>
        ) : null}
      </Modal>
    </div>
  )
}
