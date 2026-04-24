import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { getRole, getStoreId } from '../lib/auth'
import SectionCard from '../components/ui/SectionCard'
import TablePaginationBar from '../components/ui/TablePaginationBar'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useTablePagination } from '../hooks/useTablePagination'
import type { StoreStock, StoreSummary } from '../types/models'

export default function StoreStockPage() {
  const role = getRole()
  const myStoreId = getStoreId()
  const [stores, setStores] = useState<StoreSummary[]>([])
  const [selectedId, setSelectedId] = useState<number | ''>('')
  const [stocks, setStocks] = useState<StoreStock[]>([])
  /** 매장명(행)·SKU·상품명 부분 검색 */
  const [itemQ, setItemQ] = useState('')
  const [sku, setSku] = useState<string>('ALL')
  const [productName, setProductName] = useState<string>('ALL')
  const [color, setColor] = useState<string>('ALL')
  const [size, setSize] = useState<string>('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (role === 'STORE_MANAGER' && myStoreId != null) return
    if (stores.length === 0) {
      setSelectedId((prev) => (prev !== '' ? '' : prev))
      return
    }
    setSelectedId((prev) => (stores.some((s) => s.id === prev) ? prev : stores[0].id))
  }, [stores, role, myStoreId])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        if (role === 'STORE_MANAGER' && myStoreId != null) {
          if (!cancelled) {
            setStores([])
            setSelectedId(myStoreId)
          }
          return
        }
        const { data } = await api.get<StoreSummary[]>('/api/stores')
        if (cancelled) return
        const list = (data ?? []).filter((s) => {
          const kind = s.storeType ?? s.store_type
          return kind !== 'HQ'
        })
        setStores(list)
        if (myStoreId != null && list.some((s) => s.id === myStoreId)) {
          setSelectedId(myStoreId)
        } else if (list[0]) {
          setSelectedId(list[0].id)
        } else {
          setSelectedId('')
        }
      } catch {
        if (!cancelled) setError('매장 목록을 불러오지 못했습니다.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [role, myStoreId])

  useEffect(() => {
    if (selectedId === '') {
      setStocks([])
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get<StoreStock[]>(`/api/stores/${selectedId}/stocks`)
        if (!cancelled) setStocks(data ?? [])
      } catch {
        if (!cancelled) setStocks([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [selectedId])

  useEffect(() => {
    setItemQ('')
    setSku('ALL')
    setProductName('ALL')
    setColor('ALL')
    setSize('ALL')
  }, [selectedId])

  const stockFilterOptions = useMemo(() => {
    const skus = new Set<string>()
    const names = new Set<string>()
    const colors = new Set<string>()
    const sizes = new Set<string>()
    for (const s of stocks) {
      if (s.skuCode) skus.add(s.skuCode)
      if (s.productName) names.add(s.productName)
      if (s.color) colors.add(s.color)
      if (s.size) sizes.add(s.size)
    }
    return {
      skus: Array.from(skus).sort((a, b) => a.localeCompare(b, 'ko-KR')),
      productNames: Array.from(names).sort((a, b) => a.localeCompare(b, 'ko-KR')),
      colors: Array.from(colors).sort((a, b) => a.localeCompare(b, 'ko-KR')),
      sizes: Array.from(sizes).sort((a, b) => a.localeCompare(b, 'ko-KR')),
    }
  }, [stocks])

  useEffect(() => {
    setSku((prev) => (prev === 'ALL' || stocks.some((s) => s.skuCode === prev) ? prev : 'ALL'))
    setProductName((prev) =>
      prev === 'ALL' || stocks.some((s) => s.productName === prev) ? prev : 'ALL',
    )
    setColor((prev) => (prev === 'ALL' || stocks.some((s) => s.color === prev) ? prev : 'ALL'))
    setSize((prev) => (prev === 'ALL' || stocks.some((s) => s.size === prev) ? prev : 'ALL'))
  }, [stocks])

  const filteredStocks = useMemo(() => {
    const needle = itemQ.trim().toLowerCase()
    return stocks.filter((s) => {
      if (sku !== 'ALL' && s.skuCode !== sku) return false
      if (productName !== 'ALL' && s.productName !== productName) return false
      if (color !== 'ALL' && s.color !== color) return false
      if (size !== 'ALL' && s.size !== size) return false
      if (needle) {
        const storeName = (s.storeName ?? '').toLowerCase()
        const code = (s.skuCode ?? '').toLowerCase()
        const name = (s.productName ?? '').toLowerCase()
        if (!storeName.includes(needle) && !code.includes(needle) && !name.includes(needle)) {
          return false
        }
      }
      return true
    })
  }, [stocks, itemQ, sku, productName, color, size])

  const storeStockPagination = useTablePagination(filteredStocks)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">매장 재고</h1>
      </div>

      <SectionCard
        title="재고 조회"
        headerRight={
          role === 'STORE_MANAGER' && myStoreId != null ? null : (
            <label className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">매장</span>
              <select
                value={selectedId === '' ? '' : String(selectedId)}
                onChange={(e) => {
                  const v = e.target.value
                  setSelectedId(v === '' ? '' : Number(v))
                }}
                className="min-w-[10rem] rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {stores.length === 0 ? (
                  <option value="">매장 없음</option>
                ) : (
                  stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))
                )}
              </select>
            </label>
          )
        }
      >
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <p className="text-sm text-rose-600">{error}</p>
        ) : selectedId === '' ? (
          <p className="text-sm text-slate-500">매장을 선택할 수 없습니다.</p>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <input
                type="search"
                value={itemQ}
                onChange={(e) => setItemQ(e.target.value)}
                placeholder="매장명·SKU·상품명 검색"
                className="h-9 w-56 rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <label className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">SKU</span>
                <select
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="h-9 max-w-[11rem] rounded-md border border-slate-200 bg-white px-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="ALL">전체</option>
                  {stockFilterOptions.skus.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">상품명</span>
                <select
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="h-9 max-w-[14rem] rounded-md border border-slate-200 bg-white px-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="ALL">전체</option>
                  {stockFilterOptions.productNames.map((n, i) => (
                    <option key={`${n}-${i}`} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">색상</span>
                <select
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="ALL">전체</option>
                  {stockFilterOptions.colors.map((c) => (
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
                  {stockFilterOptions.sizes.map((sz) => (
                    <option key={sz} value={sz}>
                      {sz}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => {
                  setItemQ('')
                  setSku('ALL')
                  setProductName('ALL')
                  setColor('ALL')
                  setSize('ALL')
                }}
                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                초기화
              </button>
            </div>
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
                    {stocks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-3 py-12 text-center text-slate-400">
                          재고 데이터가 없습니다.
                        </td>
                      </tr>
                    ) : filteredStocks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-3 py-12 text-center text-slate-400">
                          필터 조건에 맞는 재고가 없습니다.
                        </td>
                      </tr>
                    ) : (
                      storeStockPagination.pageItems.map((s) => (
                        <tr
                          key={s.id}
                          className="border-b border-slate-100 even:bg-slate-50/40 hover:bg-blue-50/50"
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

            {filteredStocks.length > 0 ? (
              <div className="mt-3 flex justify-end">
                <TablePaginationBar
                  page={storeStockPagination.page}
                  pageCount={storeStockPagination.pageCount}
                  total={storeStockPagination.total}
                  setPage={storeStockPagination.setPage}
                  fromIdx={storeStockPagination.fromIdx}
                  toIdx={storeStockPagination.toIdx}
                />
              </div>
            ) : null}
          </>
        )}
      </SectionCard>
    </div>
  )
}
