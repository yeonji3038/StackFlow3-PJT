import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { getRole } from '../lib/auth'
import SectionCard from '../components/ui/SectionCard'
import type { Allocation, StoreSummary, WarehouseStock, WarehouseSummary } from '../types/models'

type AddedLine = { productOptionId: number; quantity: number }

function sortByNameKo<T extends { name?: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', 'ko-KR'))
}

function storeOptionLabel(s: StoreSummary): string {
  const kind = s.storeType ?? s.store_type
  const bits = [s.name, s.location, kind].filter(Boolean)
  return bits.join(' · ')
}

function stockOptionLabel(s: WarehouseStock): string {
  return `${s.skuCode} - ${s.productName} - ${s.color} - ${s.size} (재고: ${s.quantity}개)`
}

function clampIntQty(q: number, max: number): number {
  if (max < 1) return 1
  return Math.min(Math.max(1, Math.floor(q)), max)
}

export default function AllocationNewPage() {
  const navigate = useNavigate()
  const role = getRole()

  const [warehouses, setWarehouses] = useState<WarehouseSummary[]>([])
  const [stores, setStores] = useState<StoreSummary[]>([])
  const [warehousesLoading, setWarehousesLoading] = useState(true)
  const [storesLoading, setStoresLoading] = useState(true)
  const [warehousesError, setWarehousesError] = useState<string | null>(null)
  const [storesError, setStoresError] = useState<string | null>(null)
  const [warehouseId, setWarehouseId] = useState<string>('')
  const [storeId, setStoreId] = useState<string>('')
  const [warehouseStocks, setWarehouseStocks] = useState<WarehouseStock[]>([])
  const [stocksLoading, setStocksLoading] = useState(false)
  const [itemQuery, setItemQuery] = useState('')
  const [filterProduct, setFilterProduct] = useState('')
  const [filterColor, setFilterColor] = useState('')
  const [filterSize, setFilterSize] = useState('')
  const [pendingPick, setPendingPick] = useState<WarehouseStock | null>(null)
  const [pendingQty, setPendingQty] = useState(1)
  const [addedItems, setAddedItems] = useState<AddedLine[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stockByOptionId = useMemo(() => {
    const m = new Map<number, WarehouseStock>()
    for (const s of warehouseStocks) {
      m.set(s.productOptionId, s)
    }
    return m
  }, [warehouseStocks])

  const loadWarehouseAndStoreLists = useCallback(async () => {
    setWarehousesLoading(true)
    setStoresLoading(true)
    setWarehousesError(null)
    setStoresError(null)
    const [whOutcome, stOutcome] = await Promise.allSettled([
      api.get<WarehouseSummary[]>('/api/warehouses'),
      api.get<StoreSummary[]>('/api/stores'),
    ])
    if (whOutcome.status === 'fulfilled') {
      const whList = sortByNameKo(whOutcome.value.data ?? [])
      setWarehouses(whList)
      setWarehousesError(null)
      setWarehouseId((prev) => (whList.some((w) => String(w.id) === prev) ? prev : ''))
    } else {
      setWarehouses([])
      setWarehousesError('창고 목록을 불러오지 못했습니다.')
      setWarehouseId('')
    }
    if (stOutcome.status === 'fulfilled') {
      const stList = sortByNameKo(stOutcome.value.data ?? [])
      setStores(stList)
      setStoresError(null)
      setStoreId((prev) => (stList.some((s) => String(s.id) === prev) ? prev : ''))
    } else {
      setStores([])
      setStoresError('매장 목록을 불러오지 못했습니다.')
      setStoreId('')
    }
    setWarehousesLoading(false)
    setStoresLoading(false)
  }, [])

  useEffect(() => {
    if (role !== 'HQ_STAFF') return
    void loadWarehouseAndStoreLists()
  }, [role, loadWarehouseAndStoreLists])

  useEffect(() => {
    setItemQuery('')
    setFilterProduct('')
    setFilterColor('')
    setFilterSize('')
    setPendingPick(null)
    setPendingQty(1)
    setAddedItems([])
  }, [warehouseId])

  useEffect(() => {
    if (role !== 'HQ_STAFF') return
    const wid = Number(warehouseId)
    if (!Number.isFinite(wid) || wid < 1) {
      setWarehouseStocks([])
      return
    }
    let cancelled = false
    setStocksLoading(true)
    void api
      .get<WarehouseStock[]>(`/api/warehouses/${wid}/stocks`)
      .then(({ data }) => {
        if (!cancelled) setWarehouseStocks(data ?? [])
      })
      .catch(() => {
        if (!cancelled) setWarehouseStocks([])
      })
      .finally(() => {
        if (!cancelled) setStocksLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [warehouseId, role])

  const selectableStocks = useMemo(
    () => warehouseStocks.filter((s) => s.quantity > 0),
    [warehouseStocks],
  )

  const addedOptionIds = useMemo(
    () => new Set(addedItems.map((l) => l.productOptionId)),
    [addedItems],
  )

  const basePickStocks = useMemo(
    () => selectableStocks.filter((s) => !addedOptionIds.has(s.productOptionId)),
    [selectableStocks, addedOptionIds],
  )

  const uniqueProductNames = useMemo(() => {
    const u = new Set<string>()
    for (const s of basePickStocks) u.add(s.productName)
    return [...u].sort((a, b) => a.localeCompare(b, 'ko-KR'))
  }, [basePickStocks])

  const colorsForProduct = useMemo(() => {
    if (!filterProduct) return []
    const u = new Set<string>()
    for (const s of basePickStocks) {
      if (s.productName === filterProduct) u.add(s.color)
    }
    return [...u].sort((a, b) => a.localeCompare(b, 'ko-KR'))
  }, [basePickStocks, filterProduct])

  const sizesForProductColor = useMemo(() => {
    if (!filterProduct || !filterColor) return []
    const u = new Set<string>()
    for (const s of basePickStocks) {
      if (s.productName === filterProduct && s.color === filterColor) u.add(s.size)
    }
    return [...u].sort((a, b) => a.localeCompare(b, 'ko-KR'))
  }, [basePickStocks, filterProduct, filterColor])

  const filteredPickList = useMemo(() => {
    const q = itemQuery.trim().toLowerCase()
    return basePickStocks.filter((s) => {
      if (q) {
        const sku = (s.skuCode ?? '').toLowerCase()
        const name = (s.productName ?? '').toLowerCase()
        if (!sku.includes(q) && !name.includes(q)) return false
      }
      if (filterProduct && s.productName !== filterProduct) return false
      if (filterColor && s.color !== filterColor) return false
      if (filterSize && s.size !== filterSize) return false
      return true
    })
  }, [basePickStocks, itemQuery, filterProduct, filterColor, filterSize])

  const handleWarehouseChange = (value: string) => {
    setWarehouseId(value)
    setError(null)
  }

  const setFilterProductAndCascade = (name: string) => {
    setFilterProduct(name)
    setFilterColor('')
    setFilterSize('')
  }

  const setFilterColorAndCascade = (color: string) => {
    setFilterColor(color)
    setFilterSize('')
  }

  const pickStock = (s: WarehouseStock) => {
    setPendingPick(s)
    setPendingQty(1)
  }

  const pendingMax = pendingPick ? pendingPick.quantity : 0

  const adjustPendingQty = (delta: number) => {
    if (!pendingPick || pendingMax < 1) return
    setPendingQty((prev) => clampIntQty(prev + delta, pendingMax))
  }

  const setPendingQtyFromInput = (raw: string) => {
    if (!pendingPick || pendingMax < 1) return
    if (raw === '') {
      setPendingQty(1)
      return
    }
    const n = Number(raw)
    if (!Number.isFinite(n)) return
    setPendingQty(clampIntQty(n, pendingMax))
  }

  const handleAddPendingToList = () => {
    if (!pendingPick || pendingMax < 1) return
    const pid = pendingPick.productOptionId
    if (addedOptionIds.has(pid)) return
    const q = clampIntQty(pendingQty, pendingMax)
    setAddedItems((prev) => [...prev, { productOptionId: pid, quantity: q }])
    setPendingPick(null)
    setPendingQty(1)
  }

  const updateAddedQuantity = (index: number, raw: string) => {
    setAddedItems((prev) => {
      const line = prev[index]
      if (!line) return prev
      const maxQ = stockByOptionId.get(line.productOptionId)?.quantity ?? 0
      if (maxQ < 1) return prev
      let nextQ = line.quantity
      if (raw === '') nextQ = 1
      else {
        const n = Number(raw)
        if (!Number.isFinite(n)) return prev
        nextQ = clampIntQty(n, maxQ)
      }
      return prev.map((l, i) => (i === index ? { ...l, quantity: nextQ } : l))
    })
  }

  const bumpAddedQuantity = (index: number, delta: number) => {
    setAddedItems((prev) => {
      const line = prev[index]
      if (!line) return prev
      const maxQ = stockByOptionId.get(line.productOptionId)?.quantity ?? 0
      if (maxQ < 1) return prev
      return prev.map((l, i) =>
        i === index ? { ...l, quantity: clampIntQty(l.quantity + delta, maxQ) } : l,
      )
    })
  }

  const removeAddedLine = (index: number) => {
    setAddedItems((prev) => prev.filter((_, i) => i !== index))
  }

  if (role !== 'HQ_STAFF') {
    return (
      <div className="space-y-4">
        <Link to="/allocations" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          ← 배분 목록
        </Link>
        <p className="text-sm text-slate-600">배분 생성은 본사(HQ) 계정으로만 이용할 수 있습니다.</p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const wid = Number(warehouseId)
    const sid = Number(storeId)
    if (!Number.isFinite(wid) || wid < 1) {
      setError('창고를 목록에서 선택해 주세요.')
      return
    }
    if (!Number.isFinite(sid) || sid < 1) {
      setError('매장을 목록에서 선택해 주세요.')
      return
    }
    const items: { productOptionId: number; quantity: number }[] = []
    const seen = new Set<number>()
    for (const line of addedItems) {
      if (seen.has(line.productOptionId)) {
        setError('동일한 SKU가 중복되어 있습니다.')
        return
      }
      seen.add(line.productOptionId)
      const maxQ = stockByOptionId.get(line.productOptionId)?.quantity ?? 0
      const q = line.quantity
      if (!Number.isFinite(q) || q < 1) {
        setError('각 품목의 수량을 확인해 주세요.')
        return
      }
      if (maxQ < 1 || q > maxQ) {
        setError('수량이 해당 SKU 재고를 초과할 수 없습니다.')
        return
      }
      items.push({ productOptionId: line.productOptionId, quantity: Math.floor(q) })
    }
    if (items.length === 0) {
      setError('품목을 한 개 이상 추가해 주세요.')
      return
    }
    setSubmitting(true)
    try {
      const { data } = await api.post<Allocation>('/api/allocations', {
        warehouseId: wid,
        storeId: sid,
        items,
      })
      const newId = data?.id
      if (newId != null) {
        navigate(`/allocations/${newId}`, { replace: true })
      } else {
        navigate('/allocations', { replace: true })
      }
    } catch {
      setError('요청에 실패했습니다. 권한·입력값을 확인해 주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link to="/allocations" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          ← 배분 목록
        </Link>
        <h1 className="mt-2 text-lg font-semibold text-slate-900">배분 생성</h1>
        <p className="mt-1 text-sm text-slate-500">창고에서 매장으로 보낼 재고를 등록합니다.</p>
      </div>

      <SectionCard title="요청서">
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          {error && <p className="text-sm text-rose-600">{error}</p>}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">창고</label>
            <select
              value={warehouseId}
              disabled={warehousesLoading || warehouses.length === 0}
              onChange={(e) => handleWarehouseChange(e.target.value)}
              className="h-10 w-full max-w-md rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
            >
              <option value="">
                {warehousesLoading
                  ? '창고 목록 불러오는 중…'
                  : warehousesError
                    ? '창고 목록을 불러올 수 없음'
                    : warehouses.length === 0
                      ? '등록된 창고가 없습니다'
                      : '창고를 선택하세요'}
              </option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
            {warehousesError ? (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <p className="text-xs text-rose-600">{warehousesError}</p>
                <button
                  type="button"
                  onClick={() => void loadWarehouseAndStoreLists()}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800"
                >
                  다시 시도
                </button>
              </div>
            ) : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">매장</label>
            <select
              value={storeId}
              disabled={storesLoading || stores.length === 0}
              onChange={(e) => {
                setStoreId(e.target.value)
                setError(null)
              }}
              className="h-10 w-full max-w-md rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
            >
              <option value="">
                {storesLoading
                  ? '매장 목록 불러오는 중…'
                  : storesError
                    ? '매장 목록을 불러올 수 없음'
                    : stores.length === 0
                      ? '등록된 매장이 없습니다'
                      : '매장을 선택하세요'}
              </option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {storeOptionLabel(s)}
                </option>
              ))}
            </select>
            {storesError ? (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <p className="text-xs text-rose-600">{storesError}</p>
                <button
                  type="button"
                  onClick={() => void loadWarehouseAndStoreLists()}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800"
                >
                  다시 시도
                </button>
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium text-slate-700">품목</span>
              {stocksLoading ? (
                <span className="text-xs text-slate-500">재고 불러오는 중…</span>
              ) : null}
            </div>
            {!stocksLoading && selectableStocks.length === 0 && warehouseId ? (
              <p className="text-sm text-amber-800">
                선택한 창고에 출고 가능한 재고(수량 1 이상)가 없습니다.
              </p>
            ) : null}

            {warehouseId && !stocksLoading && selectableStocks.length > 0 ? (
              <div className="space-y-4 rounded-lg border border-slate-100 bg-slate-50/40 p-4">
                <label className="block text-xs font-medium text-slate-700">
                  검색 (SKU · 상품명)
                  <input
                    type="search"
                    value={itemQuery}
                    onChange={(e) => setItemQuery(e.target.value)}
                    placeholder="입력 시 아래 목록이 필터됩니다"
                    className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="block text-xs font-medium text-slate-700">
                    상품명
                    <select
                      value={filterProduct}
                      onChange={(e) => setFilterProductAndCascade(e.target.value)}
                      className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">전체</option>
                      {uniqueProductNames.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs font-medium text-slate-700">
                    색상
                    <select
                      value={filterColor}
                      disabled={!filterProduct}
                      onChange={(e) => setFilterColorAndCascade(e.target.value)}
                      className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                    >
                      <option value="">{filterProduct ? '전체' : '상품명을 먼저 선택'}</option>
                      {colorsForProduct.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs font-medium text-slate-700">
                    사이즈
                    <select
                      value={filterSize}
                      disabled={!filterProduct || !filterColor}
                      onChange={(e) => setFilterSize(e.target.value)}
                      className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                    >
                      <option value="">
                        {filterProduct && filterColor ? '전체' : '상품명·색상을 먼저 선택'}
                      </option>
                      {sizesForProductColor.map((z) => (
                        <option key={z} value={z}>
                          {z}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div>
                  <p className="mb-1 text-xs font-medium text-slate-600">
                    재고 목록 <span className="font-normal text-slate-500">(행을 클릭하면 선택)</span>
                  </p>
                  <ul className="max-h-52 overflow-auto rounded-md border border-slate-200 bg-white text-sm shadow-sm">
                    {filteredPickList.length === 0 ? (
                      <li className="px-3 py-6 text-center text-slate-500">조건에 맞는 재고가 없습니다.</li>
                    ) : (
                      filteredPickList.map((s) => {
                        const active = pendingPick?.productOptionId === s.productOptionId
                        return (
                          <li key={s.id}>
                            <button
                              type="button"
                              onClick={() => pickStock(s)}
                              className={`w-full px-3 py-2.5 text-left transition-colors ${
                                active
                                  ? 'bg-blue-50 font-medium text-blue-900'
                                  : 'text-slate-800 hover:bg-slate-50'
                              }`}
                            >
                              {stockOptionLabel(s)}
                            </button>
                          </li>
                        )
                      })
                    )}
                  </ul>
                </div>

                {pendingPick ? (
                  <div className="rounded-md border border-blue-200 bg-white p-3 shadow-sm">
                    <p className="text-sm font-medium text-slate-900">{stockOptionLabel(pendingPick)}</p>
                    <p className="mt-1 text-xs text-slate-500">선택된 품목 · 수량을 조절한 뒤 아래에서 목록에 추가하세요.</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-slate-600">수량</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => adjustPendingQty(-1)}
                          disabled={pendingQty <= 1}
                          className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-lg font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="수량 감소"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={pendingMax}
                          value={pendingQty}
                          onChange={(e) => setPendingQtyFromInput(e.target.value)}
                          className="h-9 w-16 rounded-md border border-slate-200 bg-white px-2 text-center text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => adjustPendingQty(1)}
                          disabled={pendingQty >= pendingMax}
                          className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-lg font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="수량 증가"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs text-slate-500">최대 {pendingMax}개</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPendingToList}
                      className="mt-3 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      + 품목 추가
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            {addedItems.length > 0 ? (
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">추가된 품목</p>
                <ul className="space-y-2">
                  {addedItems.map((line, idx) => {
                    const st = stockByOptionId.get(line.productOptionId)
                    const maxQ = st?.quantity ?? 0
                    const label = st
                      ? stockOptionLabel(st)
                      : `옵션 #${line.productOptionId} (재고 정보 없음)`
                    return (
                      <li
                        key={line.productOptionId}
                        className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 sm:flex-row sm:flex-wrap sm:items-center"
                      >
                        <p className="min-w-0 flex-1 text-sm text-slate-800">{label}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-slate-600">수량</span>
                          <button
                            type="button"
                            onClick={() => bumpAddedQuantity(idx, -1)}
                            disabled={line.quantity <= 1 || maxQ < 1}
                            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-lg hover:bg-slate-50 disabled:opacity-40"
                            aria-label="수량 감소"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min={1}
                            max={maxQ > 0 ? maxQ : undefined}
                            value={line.quantity}
                            onChange={(e) => updateAddedQuantity(idx, e.target.value)}
                            className="h-9 w-16 rounded-md border border-slate-200 px-2 text-center text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => bumpAddedQuantity(idx, 1)}
                            disabled={maxQ < 1 || line.quantity >= maxQ}
                            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-lg hover:bg-slate-50 disabled:opacity-40"
                            aria-label="수량 증가"
                          >
                            +
                          </button>
                          {maxQ > 0 ? (
                            <span className="text-xs text-slate-500">최대 {maxQ}</span>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => removeAddedLine(idx)}
                            className="ml-1 text-sm font-medium text-rose-600 hover:underline"
                          >
                            삭제
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={
                submitting ||
                stocksLoading ||
                warehousesLoading ||
                storesLoading ||
                !warehouseId ||
                !storeId
              }
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:opacity-50"
            >
              등록하기
            </button>
            <Link
              to="/allocations"
              className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              취소
            </Link>
          </div>
        </form>
      </SectionCard>
    </div>
  )
}
