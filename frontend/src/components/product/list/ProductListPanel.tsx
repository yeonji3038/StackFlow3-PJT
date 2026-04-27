import { useCallback, useEffect, useMemo, useState } from 'react'
import { isAxiosError } from 'axios'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../lib/api'
import SectionCard from '../../ui/SectionCard'
import LoadingSpinner from '../../ui/LoadingSpinner'
import TablePaginationBar from '../../ui/TablePaginationBar'
import { useTablePagination } from '../../../hooks/useTablePagination'
import { PRODUCT_STATUS_OPTIONS, productStatusLabel, type ProductStatusValue } from '../../../lib/productStatus'
import type { ProductListItem } from '../types'

function formatWon(n: number) {
  return n.toLocaleString('ko-KR')
}

type Props = {
  canMutate: boolean
  /** 라우트 `location.key` 등 변경 시 목록을 다시 불러옵니다. */
  refreshKey?: number | string
}

export default function ProductListPanel({ canMutate, refreshKey = 0 }: Props) {
  const navigate = useNavigate()
  const [rows, setRows] = useState<ProductListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | ProductStatusValue>('ALL')
  const [brandFilter, setBrandFilter] = useState<number | 'ALL'>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [seasonFilter, setSeasonFilter] = useState<string>('ALL')
  const [statusSavingId, setStatusSavingId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get<ProductListItem[]>('/api/products')
      setRows(data ?? [])
    } catch {
      setError('상품 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load, refreshKey])

  const brandOptions = useMemo(() => {
    const m = new Map<number, string>()
    for (const r of rows) m.set(r.brandId, r.brandName)
    return [...m.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'ko-KR'))
  }, [rows])

  const categoryOptions = useMemo(() => {
    const s = new Set<string>()
    for (const r of rows) s.add(r.categoryName)
    return [...s].sort((a, b) => a.localeCompare(b, 'ko-KR'))
  }, [rows])

  const seasonOptions = useMemo(() => {
    const s = new Set<string>()
    for (const r of rows) s.add(r.seasonName)
    return [...s].sort((a, b) => a.localeCompare(b, 'ko-KR'))
  }, [rows])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return rows
      .filter((r) => {
        if (statusFilter !== 'ALL' && r.status !== statusFilter) return false
        if (brandFilter !== 'ALL' && r.brandId !== brandFilter) return false
        if (categoryFilter !== 'ALL' && r.categoryName !== categoryFilter) return false
        if (seasonFilter !== 'ALL' && r.seasonName !== seasonFilter) return false
        if (!needle) return true
        const hay = [r.name, r.brandName, r.categoryName, r.seasonName].join(' ').toLowerCase()
        return hay.includes(needle)
      })
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }, [rows, q, statusFilter, brandFilter, categoryFilter, seasonFilter])

  const pagination = useTablePagination(filtered)

  const putProduct = async (id: number, body: Record<string, unknown>) => {
    await api.put(`/api/products/${id}`, body)
    await load()
  }

  const handleStatusChange = async (row: ProductListItem, next: ProductStatusValue) => {
    if (!canMutate || next === row.status) return
    setError(null)
    setStatusSavingId(row.id)
    try {
      await putProduct(row.id, {
        name: row.name,
        brandId: row.brandId,
        categoryId: row.categoryId,
        seasonId: row.seasonId,
        price: row.price,
        cost: row.cost,
        description: row.description ?? undefined,
        status: next,
      })
    } catch (err) {
      if (isAxiosError(err)) {
        const d = err.response?.data as { message?: string } | string | undefined
        if (typeof d === 'string') setError(d)
        else if (d && typeof d === 'object' && typeof d.message === 'string') setError(d.message)
        else setError('상태 변경에 실패했습니다.')
      } else {
        setError('상태 변경에 실패했습니다.')
      }
    } finally {
      setStatusSavingId(null)
    }
  }

  return (
    <SectionCard
      title="상품 목록"
      headerRight={
        <div className="flex max-w-full flex-1 flex-wrap items-center justify-end gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="상품명 · 브랜드 · 카테고리 · 시즌"
            className="h-9 min-w-[12rem] flex-1 rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:max-w-xs"
          />
          <label className="flex items-center gap-2 text-sm">
            <span className="shrink-0 text-slate-500">브랜드</span>
            <select
              value={brandFilter === 'ALL' ? 'ALL' : String(brandFilter)}
              onChange={(e) => {
                const v = e.target.value
                setBrandFilter(v === 'ALL' ? 'ALL' : Number(v))
              }}
              className="h-9 max-w-[10rem] rounded-md border border-slate-200 bg-white px-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">전체</option>
              {brandOptions.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="shrink-0 text-slate-500">카테고리</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 max-w-[10rem] rounded-md border border-slate-200 bg-white px-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">전체</option>
              {categoryOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="shrink-0 text-slate-500">시즌</span>
            <select
              value={seasonFilter}
              onChange={(e) => setSeasonFilter(e.target.value)}
              className="h-9 max-w-[10rem] rounded-md border border-slate-200 bg-white px-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">전체</option>
              {seasonOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="shrink-0 text-slate-500">상태</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">전체</option>
              {PRODUCT_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => {
              setQ('')
              setStatusFilter('ALL')
              setBrandFilter('ALL')
              setCategoryFilter('ALL')
              setSeasonFilter('ALL')
            }}
            className="h-9 shrink-0 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            초기화
          </button>
        </div>
      }
    >
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="space-y-2">
          <p className="text-sm text-rose-600">{error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            다시 시도
          </button>
        </div>
      ) : (
        <div>
          <div className="overflow-x-auto rounded-md border border-slate-100">
            <div className="max-h-[min(28rem,calc(100vh-14rem))] overflow-y-auto">
              <table className="w-full min-w-[960px] border-collapse text-sm">
                <thead>
                  <tr className="sticky top-0 z-[1] border-b border-slate-200 bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    <th className="px-3 py-2.5">상품명</th>
                    <th className="px-3 py-2.5">브랜드</th>
                    <th className="px-3 py-2.5">카테고리</th>
                    <th className="px-3 py-2.5">시즌</th>
                    <th className="px-3 py-2.5 text-right">판매가</th>
                    <th className="px-3 py-2.5 text-right">원가</th>
                    <th className="px-3 py-2.5">상태</th>
                    <th className="px-3 py-2.5">등록일</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-12 text-center text-slate-400">
                        조건에 맞는 상품이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    pagination.pageItems.map((r) => (
                      <tr
                        key={r.id}
                        onClick={() => navigate(`/admin/products/${r.id}`)}
                        className="cursor-pointer border-b border-slate-100 even:bg-slate-50/40 hover:bg-blue-50/50"
                      >
                        <td className="px-3 py-2 font-medium text-slate-800">{r.name}</td>
                        <td className="px-3 py-2 text-slate-700">{r.brandName}</td>
                        <td className="px-3 py-2 text-slate-700">{r.categoryName}</td>
                        <td className="px-3 py-2 text-slate-700">{r.seasonName}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-slate-800">
                          {formatWon(r.price)}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-slate-700">
                          {formatWon(r.cost)}
                        </td>
                        <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                          {canMutate ? (
                            <select
                              value={r.status}
                              disabled={statusSavingId === r.id}
                              onChange={(e) =>
                                void handleStatusChange(r, e.target.value as ProductStatusValue)
                              }
                              className="h-8 max-w-[7.5rem] rounded-md border border-slate-200 bg-white px-1.5 text-xs shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
                            >
                              {PRODUCT_STATUS_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-slate-700">{productStatusLabel(r.status)}</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-500">
                          {r.createdAt ? new Date(r.createdAt).toLocaleString('ko-KR') : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-3 flex justify-end">
            <TablePaginationBar
              page={pagination.page}
              pageCount={pagination.pageCount}
              total={pagination.total}
              setPage={pagination.setPage}
              fromIdx={pagination.fromIdx}
              toIdx={pagination.toIdx}
            />
          </div>
        </div>
      )}
    </SectionCard>
  )
}
