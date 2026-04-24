import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { getRole, getStoreId } from '../lib/auth'
import { orderStatusDisplayText, orderStatusLabel } from '../lib/orderLabels'
import SectionCard from '../components/ui/SectionCard'
import TablePaginationBar from '../components/ui/TablePaginationBar'
import Modal from '../components/ui/Modal'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useTablePagination } from '../hooks/useTablePagination'
import type { Order } from '../types/models'

export default function OrdersPage() {
  const role = getRole()
  const myStoreId = getStoreId()

  const [rows, setRows] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [unavailable, setUnavailable] = useState(false)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<string>('ALL')
  const [store, setStore] = useState<number | 'ALL'>(() => {
    if (role === 'STORE_MANAGER' && myStoreId != null) return myStoreId
    return 'ALL'
  })
  const [selected, setSelected] = useState<Order | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setUnavailable(false)
      try {
        const { data } = await api.get<Order[]>('/api/orders')
        if (!cancelled) setRows(Array.isArray(data) ? data : [])
      } catch {
        if (!cancelled) {
          setUnavailable(true)
          setRows([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const filterOptions = useMemo(() => {
    const stores = new Map<number, string>()
    const statuses = new Set<string>()
    for (const o of rows) {
      if (typeof o.storeId === 'number') stores.set(o.storeId, o.storeName ?? String(o.storeId))
      if (o.status) statuses.add(o.status)
    }
    return {
      stores: Array.from(stores.entries()).sort((a, b) => a[1].localeCompare(b[1], 'ko-KR')),
      statuses: Array.from(statuses).sort((a, b) => a.localeCompare(b, 'ko-KR')),
    }
  }, [rows])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return rows.filter((o) => {
      if (status !== 'ALL' && o.status !== status) return false
      if (store !== 'ALL' && o.storeId !== store) return false
      if (!needle) return true

      const hay = [
        o.storeName,
        o.status,
        o.statusDescription,
        o.requestedByName,
        o.approvedByName,
        o.note,
        ...(o.items ?? []).flatMap((it) => [it.skuCode, it.productName, it.color, it.size]),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return hay.includes(needle)
    })
  }, [rows, q, status, store])

  const orderPagination = useTablePagination(filtered)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">발주 관리</h1>
      </div>

      <SectionCard
        title="발주 목록"
        headerRight={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="매장/상태/SKU/상품명/메모 검색"
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
                {filterOptions.statuses.map((s) => (
                  <option key={s} value={s}>
                    {orderStatusLabel(s)}
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
                disabled={role === 'STORE_MANAGER' && myStoreId != null}
                className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="ALL">전체</option>
                {filterOptions.stores.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={() => {
                setQ('')
                setStatus('ALL')
                setStore(role === 'STORE_MANAGER' && myStoreId != null ? myStoreId : 'ALL')
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
        ) : unavailable ? (
          <p className="text-sm text-slate-600">
            발주 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-slate-500">등록된 발주가 없습니다.</p>
        ) : (
          <div>
            <div className="overflow-x-auto rounded-md border border-slate-100">
              <div className="max-h-[min(28rem,calc(100vh-14rem))] overflow-y-auto">
                <table className="w-full min-w-[920px] border-collapse text-sm">
                  <thead>
                    <tr className="sticky top-0 z-[1] border-b border-slate-200 bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                      <th className="px-3 py-2.5">ID</th>
                      <th className="px-3 py-2.5">매장</th>
                      <th className="px-3 py-2.5">상태</th>
                      <th className="px-3 py-2.5">요청자</th>
                      <th className="px-3 py-2.5">승인자</th>
                      <th className="px-3 py-2.5 text-right">품목 수</th>
                      <th className="px-3 py-2.5">등록일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderPagination.pageItems.map((o) => (
                      <tr
                        key={o.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelected(o)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') setSelected(o)
                        }}
                        className="cursor-pointer border-b border-slate-100 even:bg-slate-50/40 hover:bg-blue-50/50"
                      >
                        <td className="px-3 py-2 font-mono text-xs text-slate-600">{o.id}</td>
                        <td className="px-3 py-2 text-slate-800">{o.storeName}</td>
                        <td className="px-3 py-2">
                          <span className="rounded-md bg-white px-2 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                            {orderStatusDisplayText(o)}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-700">{o.requestedByName ?? '—'}</td>
                        <td className="px-3 py-2 text-slate-700">{o.approvedByName ?? '—'}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-slate-800">
                          {o.items?.length ?? 0}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-500">
                          {o.createdAt ? new Date(o.createdAt).toLocaleString('ko-KR') : '—'}
                        </td>
                      </tr>
                    ))}
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
                page={orderPagination.page}
                pageCount={orderPagination.pageCount}
                total={orderPagination.total}
                setPage={orderPagination.setPage}
                fromIdx={orderPagination.fromIdx}
                toIdx={orderPagination.toIdx}
              />
            </div>
          </div>
        )}
      </SectionCard>

      <Modal
        open={selected != null}
        onClose={() => setSelected(null)}
        title={selected ? `발주 #${selected.id}` : '발주 상세'}
        description={selected ? `${selected.storeName} · ${orderStatusDisplayText(selected)}` : undefined}
      >
        {selected ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                <p className="text-xs font-medium uppercase text-slate-500">기본 정보</p>
                <p className="mt-1 text-sm text-slate-800">
                  매장: <span className="font-semibold">{selected.storeName}</span> (ID {selected.storeId})
                </p>
                <p className="mt-1 text-sm text-slate-800">
                  상태: <span className="font-semibold">{orderStatusDisplayText(selected)}</span>
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  등록: {selected.createdAt ? new Date(selected.createdAt).toLocaleString('ko-KR') : '—'}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                <p className="text-xs font-medium uppercase text-slate-500">담당자</p>
                <p className="mt-1 text-sm text-slate-800">
                  요청자: <span className="font-semibold">{selected.requestedByName ?? '—'}</span>
                </p>
                <p className="mt-1 text-sm text-slate-800">
                  승인자: <span className="font-semibold">{selected.approvedByName ?? '—'}</span>
                </p>
                {selected.note ? (
                  <p className="mt-2 text-sm text-slate-700">
                    메모: <span className="text-slate-800">{selected.note}</span>
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">메모 없음</p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 px-4 py-3">
                <h3 className="text-sm font-semibold text-slate-900">발주 품목</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  총 <span className="font-semibold tabular-nums text-slate-700">{selected.items?.length ?? 0}</span>개
                </p>
              </div>
              <div className="overflow-x-auto p-4">
                <table className="w-full min-w-[720px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="px-2 py-2">SKU</th>
                      <th className="px-2 py-2">상품</th>
                      <th className="px-2 py-2">색상</th>
                      <th className="px-2 py-2">사이즈</th>
                      <th className="px-2 py-2 text-right">수량</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selected.items ?? []).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-2 py-8 text-center text-slate-400">
                          품목이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      (selected.items ?? []).map((it) => (
                        <tr
                          key={it.id}
                          className="border-b border-slate-100 even:bg-slate-50/40 hover:bg-blue-50/40"
                        >
                          <td className="px-2 py-2 font-mono text-xs text-slate-600">{it.skuCode}</td>
                          <td className="px-2 py-2 text-slate-800">{it.productName}</td>
                          <td className="px-2 py-2 text-slate-700">{it.color}</td>
                          <td className="px-2 py-2 text-slate-700">{it.size}</td>
                          <td className="px-2 py-2 text-right font-medium tabular-nums text-slate-900">
                            {it.quantity}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
