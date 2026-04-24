import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { getRole, getWarehouseId } from '../lib/auth'
import { resolveDefaultWarehouseId } from '../lib/warehouseContext'
import SectionCard from '../components/ui/SectionCard'
import TablePaginationBar from '../components/ui/TablePaginationBar'
import Modal from '../components/ui/Modal'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useTablePagination } from '../hooks/useTablePagination'
import type { WarehouseStock, WarehouseSummary } from '../types/models'

export default function WarehouseStockPage() {
  const role = getRole()
  const [warehouses, setWarehouses] = useState<WarehouseSummary[]>([])
  const [selectedId, setSelectedId] = useState<number | ''>('')
  const [stocks, setStocks] = useState<WarehouseStock[]>([])
  const [q, setQ] = useState('')
  const [color, setColor] = useState<string>('ALL')
  const [size, setSize] = useState<string>('ALL')
  const [selected, setSelected] = useState<WarehouseStock | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await api.get<WarehouseSummary[]>('/api/warehouses')
        if (cancelled) return
        const list = data ?? []
        setWarehouses(list)
        const preferred =
          getWarehouseId() ??
          (role === 'WAREHOUSE_STAFF' ? await resolveDefaultWarehouseId() : null)
        if (preferred != null && list.some((w) => w.id === preferred)) {
          setSelectedId(preferred)
        } else if (list[0]) {
          setSelectedId(list[0].id)
        } else {
          setSelectedId('')
        }
      } catch {
        if (!cancelled) setError('창고 목록을 불러오지 못했습니다.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [role])

  useEffect(() => {
    if (selectedId === '') {
      setStocks([])
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get<WarehouseStock[]>(`/api/warehouses/${selectedId}/stocks`)
        if (!cancelled) setStocks(data ?? [])
      } catch {
        if (!cancelled) setStocks([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [selectedId])

  const filterOptions = useMemo(() => {
    const colors = new Set<string>()
    const sizes = new Set<string>()
    for (const s of stocks) {
      if (s.color) colors.add(s.color)
      if (s.size) sizes.add(s.size)
    }
    return {
      colors: Array.from(colors).sort((a, b) => a.localeCompare(b, 'ko-KR')),
      sizes: Array.from(sizes).sort((a, b) => a.localeCompare(b, 'ko-KR')),
    }
  }, [stocks])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return stocks.filter((s) => {
      if (color !== 'ALL' && s.color !== color) return false
      if (size !== 'ALL' && s.size !== size) return false
      if (!needle) return true
      const sku = (s.skuCode ?? '').toLowerCase()
      const name = (s.productName ?? '').toLowerCase()
      return sku.includes(needle) || name.includes(needle)
    })
  }, [stocks, q, color, size])

  const stockPagination = useTablePagination(filtered)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">창고 재고</h1>
      </div>

      <SectionCard
        title="재고 조회"
        headerRight={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">창고</span>
              <select
                value={selectedId === '' ? '' : String(selectedId)}
                onChange={(e) => {
                  const v = e.target.value
                  setSelectedId(v === '' ? '' : Number(v))
                }}
                className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {warehouses.length === 0 ? (
                  <option value="">창고 없음</option>
                ) : (
                  warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))
                )}
              </select>
            </label>

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="SKU 또는 상품명 검색"
              className="h-9 w-56 rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            <label className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">색상</span>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">전체</option>
                {filterOptions.colors.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">사이즈</span>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">전체</option>
                {filterOptions.sizes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={() => {
                setQ('')
                setColor('ALL')
                setSize('ALL')
              }}
              className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              초기화
            </button>
          </div>
        }
      >
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <p className="text-sm text-rose-600">{error}</p>
        ) : (
          <div>
            <div className="overflow-x-auto rounded-md border border-slate-100">
              <div className="max-h-[min(28rem,calc(100vh-14rem))] overflow-y-auto">
                <table className="w-full min-w-[640px] border-collapse text-sm">
                  <thead>
                    <tr className="sticky top-0 z-[1] border-b border-slate-200 bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                      <th className="px-3 py-2.5">SKU</th>
                      <th className="px-3 py-2.5">상품명</th>
                      <th className="px-3 py-2.5">색상</th>
                      <th className="px-3 py-2.5">사이즈</th>
                      <th className="px-3 py-2.5 text-right">수량</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-3 py-12 text-center text-slate-400">
                          검색/필터 조건에 맞는 데이터가 없습니다.
                        </td>
                      </tr>
                    ) : (
                      stockPagination.pageItems.map((s) => (
                        <tr
                          key={s.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelected(s)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') setSelected(s)
                          }}
                          className="cursor-pointer border-b border-slate-100 even:bg-slate-50/40 hover:bg-blue-50/50"
                        >
                          <td className="px-3 py-2 font-mono text-xs text-slate-600">{s.skuCode}</td>
                          <td className="px-3 py-2 text-slate-800">{s.productName}</td>
                          <td className="px-3 py-2 text-slate-700">{s.color}</td>
                          <td className="px-3 py-2 text-slate-700">{s.size}</td>
                          <td className="px-3 py-2 text-right font-medium tabular-nums text-slate-900">
                            {s.quantity}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                전체 <span className="font-semibold tabular-nums text-slate-700">{stocks.length}</span>
                건 · 결과{' '}
                <span className="font-semibold tabular-nums text-slate-700">{filtered.length}</span>
                건
              </p>
              <TablePaginationBar
                page={stockPagination.page}
                pageCount={stockPagination.pageCount}
                total={stockPagination.total}
                setPage={stockPagination.setPage}
                fromIdx={stockPagination.fromIdx}
                toIdx={stockPagination.toIdx}
              />
            </div>
          </div>
        )}
      </SectionCard>

      <Modal
        open={selected != null}
        onClose={() => setSelected(null)}
        title={selected ? `${selected.skuCode} 상세` : '상세'}
      >
        {selected ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                <p className="text-xs font-medium uppercase text-slate-500">상품</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{selected.productName}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {selected.color} · {selected.size}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                <p className="text-xs font-medium uppercase text-slate-500">재고 수량</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
                  {selected.quantity}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  창고: {selected.warehouseName} (ID {selected.warehouseId})
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[420px] border-collapse text-sm">
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="w-36 bg-slate-50 px-3 py-2 text-xs font-medium uppercase text-slate-500">
                      SKU
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-700">{selected.skuCode}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="w-36 bg-slate-50 px-3 py-2 text-xs font-medium uppercase text-slate-500">
                      옵션 ID
                    </td>
                    <td className="px-3 py-2 text-slate-800">{selected.productOptionId}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="w-36 bg-slate-50 px-3 py-2 text-xs font-medium uppercase text-slate-500">
                      창고 ID
                    </td>
                    <td className="px-3 py-2 text-slate-800">{selected.warehouseId}</td>
                  </tr>
                  <tr>
                    <td className="w-36 bg-slate-50 px-3 py-2 text-xs font-medium uppercase text-slate-500">
                      재고 ID
                    </td>
                    <td className="px-3 py-2 text-slate-800">{selected.id}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
