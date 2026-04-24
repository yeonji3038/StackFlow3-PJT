import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { allocationStatusLabel } from '../lib/allocationLabels'
import SectionCard from '../components/ui/SectionCard'
import TablePaginationBar from '../components/ui/TablePaginationBar'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useTablePagination } from '../hooks/useTablePagination'
import type { Allocation } from '../types/models'

function toInputDate(d: Date): string {
  const yyyy = String(d.getFullYear())
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function parseDateOnly(value: string): Date | null {
  if (!value) return null
  const d = new Date(`${value}T00:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

function matchesStatusFilter(filter: string, rowStatus: string): boolean {
  if (filter === 'ALL') return true
  if (filter.includes(',')) {
    const allowed = new Set(filter.split(',').map((s) => s.trim()).filter(Boolean))
    return allowed.has(rowStatus)
  }
  return rowStatus === filter
}

export default function AllocationsPage() {
  const [searchParams] = useSearchParams()
  const [rows, setRows] = useState<Allocation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<string>(() => {
    const s = searchParams.get('status')
    return s != null && s !== '' ? s : 'ALL'
  })

  useEffect(() => {
    const s = searchParams.get('status')
    setStatus(s != null && s !== '' ? s : 'ALL')
  }, [searchParams])

  const [warehouse, setWarehouse] = useState<number | 'ALL'>('ALL')
  const [store, setStore] = useState<number | 'ALL'>('ALL')
  const [from, setFrom] = useState<string>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return toInputDate(d)
  })
  const [to, setTo] = useState<string>(() => toInputDate(new Date()))

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await api.get<Allocation[]>('/api/allocations')
        if (!cancelled) setRows(data ?? [])
      } catch {
        if (!cancelled) setError('배분 목록을 불러오지 못했습니다.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const filterOptions = useMemo(() => {
    const warehouses = new Map<number, string>()
    const stores = new Map<number, string>()
    const statuses = new Set<string>()
    for (const a of rows) {
      warehouses.set(a.warehouseId, a.warehouseName ?? String(a.warehouseId))
      stores.set(a.storeId, a.storeName ?? String(a.storeId))
      if (a.status) statuses.add(a.status)
    }
    return {
      warehouses: Array.from(warehouses.entries()).sort((a, b) => a[1].localeCompare(b[1], 'ko-KR')),
      stores: Array.from(stores.entries()).sort((a, b) => a[1].localeCompare(b[1], 'ko-KR')),
      statuses: Array.from(statuses).sort((a, b) => a.localeCompare(b, 'ko-KR')),
    }
  }, [rows])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const fromD = parseDateOnly(from)
    const toD = parseDateOnly(to)
    const toEnd = toD ? new Date(toD.getTime() + 24 * 60 * 60 * 1000 - 1) : null

    return rows
      .filter((a) => {
        if (!matchesStatusFilter(status, a.status)) return false
        if (warehouse !== 'ALL' && a.warehouseId !== warehouse) return false
        if (store !== 'ALL' && a.storeId !== store) return false

        if (fromD || toEnd) {
          const created = a.createdAt ? new Date(a.createdAt) : null
          if (!created || Number.isNaN(created.getTime())) return false
          if (fromD && created < fromD) return false
          if (toEnd && created > toEnd) return false
        }

        if (!needle) return true
        const hay = [
          a.warehouseName,
          a.storeName,
          a.status,
          allocationStatusLabel(a.status),
          a.requestedByName,
          a.approvedByName ?? '',
          ...(a.items ?? []).flatMap((it) => [it.skuCode, it.productName, it.color, it.size]),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return hay.includes(needle)
      })
      .sort((a, b) => {
        const at = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return bt - at
      })
  }, [rows, q, status, warehouse, store, from, to])

  const allocPagination = useTablePagination(filtered)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">배분 관리</h1>
      </div>

      <SectionCard
        title="배분 목록"
        headerRight={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="창고/매장/SKU/상품명/요청자 검색"
              className="h-9 w-64 rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            <label className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">상태</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">전체</option>
                <option value="REQUESTED,APPROVED">처리 대기 (요청·승인)</option>
                {filterOptions.statuses.map((s) => (
                  <option key={s} value={s}>
                    {allocationStatusLabel(s)}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">창고</span>
              <select
                value={warehouse === 'ALL' ? 'ALL' : String(warehouse)}
                onChange={(e) => {
                  const v = e.target.value
                  setWarehouse(v === 'ALL' ? 'ALL' : Number(v))
                }}
                className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">전체</option>
                {filterOptions.warehouses.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">매장</span>
              <select
                value={store === 'ALL' ? 'ALL' : String(store)}
                onChange={(e) => {
                  const v = e.target.value
                  setStore(v === 'ALL' ? 'ALL' : Number(v))
                }}
                className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">전체</option>
                {filterOptions.stores.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">기간</span>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-slate-400">~</span>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </label>

            <button
              type="button"
              onClick={() => {
                setQ('')
                setStatus('ALL')
                setWarehouse('ALL')
                setStore('ALL')
                const d = new Date()
                d.setDate(d.getDate() - 30)
                setFrom(toInputDate(d))
                setTo(toInputDate(new Date()))
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
                <table className="w-full min-w-[720px] border-collapse text-sm">
                  <thead>
                    <tr className="sticky top-0 z-[1] border-b border-slate-200 bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                      <th className="px-3 py-2.5">ID</th>
                      <th className="px-3 py-2.5">창고</th>
                      <th className="px-3 py-2.5">매장</th>
                      <th className="px-3 py-2.5">상태</th>
                      <th className="px-3 py-2.5">요청자</th>
                      <th className="px-3 py-2.5 text-right">품목 수</th>
                      <th className="px-3 py-2.5">등록일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-3 py-12 text-center text-slate-400">
                          검색/필터 조건에 맞는 데이터가 없습니다.
                        </td>
                      </tr>
                    ) : (
                      allocPagination.pageItems.map((a) => (
                        <tr
                          key={a.id}
                          className="border-b border-slate-100 even:bg-slate-50/40 hover:bg-blue-50/50"
                        >
                          <td className="px-3 py-2 font-mono text-xs text-slate-600">{a.id}</td>
                          <td className="px-3 py-2 text-slate-800">{a.warehouseName}</td>
                          <td className="px-3 py-2 text-slate-800">{a.storeName}</td>
                          <td className="px-3 py-2">
                            <span className="rounded-md bg-white px-2 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                              {allocationStatusLabel(a.status)}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-slate-700">{a.requestedByName}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-slate-800">
                            {a.items?.length ?? 0}
                          </td>
                          <td className="px-3 py-2 text-xs text-slate-500">
                            {a.createdAt
                              ? new Date(a.createdAt).toLocaleString('ko-KR')
                              : '—'}
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
                전체 <span className="font-semibold tabular-nums text-slate-700">{rows.length}</span>건 ·
                결과 <span className="font-semibold tabular-nums text-slate-700">{filtered.length}</span>건
              </p>
              <TablePaginationBar
                page={allocPagination.page}
                pageCount={allocPagination.pageCount}
                total={allocPagination.total}
                setPage={allocPagination.setPage}
                fromIdx={allocPagination.fromIdx}
                toIdx={allocPagination.toIdx}
              />
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  )
}
