import { useCallback, useEffect, useMemo, useState } from 'react'
import { isAxiosError } from 'axios'
import { api } from '../../../lib/api'
import { PRODUCT_STATUS_OPTIONS, type ProductStatusValue } from '../../../lib/productStatus'

type BrandRow = { id: number; name: string }
type CategoryNode = { id: number; name: string; children?: CategoryNode[] }
type SeasonRow = {
  id: number
  name: string
  year?: number
}

export type { ProductStatusValue }

type Props = {
  onRegistered?: () => void
}

function flattenCategories(nodes: CategoryNode[], parentLabel = ''): { id: number; label: string }[] {
  const rows: { id: number; label: string }[] = []
  for (const n of nodes) {
    const label = parentLabel ? `${parentLabel} › ${n.name}` : n.name
    rows.push({ id: n.id, label })
    if (n.children?.length) {
      rows.push(...flattenCategories(n.children, label))
    }
  }
  return rows
}

function inputClass() {
  return 'h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
}

export default function ProductRegisterForm({ onRegistered }: Props) {
  const [brands, setBrands] = useState<BrandRow[]>([])
  const [categories, setCategories] = useState<CategoryNode[]>([])
  const [seasons, setSeasons] = useState<SeasonRow[]>([])
  const [metaLoading, setMetaLoading] = useState(true)
  const [metaError, setMetaError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [brandId, setBrandId] = useState<string>('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [seasonId, setSeasonId] = useState<string>('')
  const [price, setPrice] = useState('')
  const [cost, setCost] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<ProductStatusValue>('ON_SALE')

  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const categoryOptions = useMemo(() => flattenCategories(categories), [categories])

  const loadMeta = useCallback(async () => {
    setMetaLoading(true)
    setMetaError(null)
    try {
      const [b, c, s] = await Promise.all([
        api.get<BrandRow[]>('/api/brands'),
        api.get<CategoryNode[]>('/api/categories'),
        api.get<SeasonRow[]>('/api/seasons'),
      ])
      setBrands(b.data ?? [])
      setCategories(c.data ?? [])
      setSeasons(s.data ?? [])
    } catch {
      setMetaError('브랜드·카테고리·시즌 목록을 불러오지 못했습니다.')
    } finally {
      setMetaLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadMeta()
  }, [loadMeta])

  const resetForm = () => {
    setName('')
    setBrandId('')
    setCategoryId('')
    setSeasonId('')
    setPrice('')
    setCost('')
    setDescription('')
    setStatus('ON_SALE')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSuccess(null)

    const b = Number(brandId)
    const cat = Number(categoryId)
    const sea = Number(seasonId)
    const p = Number.parseInt(price.replace(/,/g, ''), 10)
    const co = Number.parseInt(cost.replace(/,/g, ''), 10)

    if (!name.trim()) {
      setFormError('상품명을 입력하세요.')
      return
    }
    if (!Number.isFinite(b) || b <= 0) {
      setFormError('브랜드를 선택하세요.')
      return
    }
    if (!Number.isFinite(cat) || cat <= 0) {
      setFormError('카테고리를 선택하세요.')
      return
    }
    if (!Number.isFinite(sea) || sea <= 0) {
      setFormError('시즌을 선택하세요.')
      return
    }
    if (!Number.isFinite(p) || p < 0) {
      setFormError('판매가를 올바르게 입력하세요.')
      return
    }
    if (!Number.isFinite(co) || co < 0) {
      setFormError('원가를 올바르게 입력하세요.')
      return
    }

    setSubmitting(true)
    try {
      const body: Record<string, unknown> = {
        name: name.trim(),
        brandId: b,
        categoryId: cat,
        seasonId: sea,
        price: p,
        cost: co,
        status,
      }
      const desc = description.trim()
      if (desc) body.description = desc

      const { data } = await api.post<{ id: number; name: string }>('/api/products', body)
      setSuccess(`상품이 등록되었습니다. (ID ${data.id}${data.name ? ` · ${data.name}` : ''})`)
      resetForm()
      onRegistered?.()
    } catch (err) {
      if (isAxiosError(err)) {
        const d = err.response?.data as { message?: string } | string | undefined
        if (typeof d === 'string') setFormError(d)
        else if (d && typeof d === 'object' && typeof d.message === 'string') setFormError(d.message)
        else setFormError('등록에 실패했습니다.')
      } else {
        setFormError('등록에 실패했습니다.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (metaLoading) {
    return <p className="text-sm text-slate-500">선택 목록을 불러오는 중…</p>
  }

  if (metaError) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-rose-600">{metaError}</p>
        <button
          type="button"
          onClick={() => void loadMeta()}
          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          다시 시도
        </button>
      </div>
    )
  }

  return (
    <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-medium text-slate-600">상품명</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass()}
            placeholder="예: 린넨 셔츠"
            maxLength={200}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">브랜드</span>
          <select
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            className={inputClass()}
            required
          >
            <option value="">선택</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">카테고리</span>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={inputClass()}
            required
          >
            <option value="">선택</option>
            {categoryOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-medium text-slate-600">시즌</span>
          <select
            value={seasonId}
            onChange={(e) => setSeasonId(e.target.value)}
            className={inputClass()}
            required
          >
            <option value="">선택</option>
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.year != null ? `${s.name} (${s.year})` : s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">판매가 (원)</span>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={inputClass()}
            inputMode="numeric"
            placeholder="0"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">원가 (원)</span>
          <input
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            className={inputClass()}
            inputMode="numeric"
            placeholder="0"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-medium text-slate-600">상태</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProductStatusValue)}
            className={inputClass()}
          >
            {PRODUCT_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-medium text-slate-600">설명 (선택)</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[88px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="소재, 핏 등 간단 메모"
            rows={3}
          />
        </label>
      </div>

      {formError ? <p className="text-sm text-rose-600">{formError}</p> : null}
      {success ? <p className="text-sm text-emerald-700">{success}</p> : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting ? '등록 중…' : '상품 등록'}
        </button>
        <button
          type="button"
          onClick={() => {
            resetForm()
            setFormError(null)
            setSuccess(null)
          }}
          className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          입력 초기화
        </button>
      </div>
    </form>
  )
}
