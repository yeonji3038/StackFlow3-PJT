import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { Trash2 } from 'lucide-react'
import { api } from '../../../lib/api'
import { getRole } from '../../../lib/auth'
import SectionCard from '../../../components/ui/SectionCard'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import type { ProductListItem } from '../../../components/product/types'
import { PRODUCT_STATUS_OPTIONS, productStatusLabel, type ProductStatusValue } from '../../../lib/productStatus'

function inputClass() {
  return 'h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
}

function formatWon(n: number) {
  return `${n.toLocaleString('ko-KR')}원`
}

export default function ProductDetailPage() {
  const { id: idParam } = useParams()
  const navigate = useNavigate()
  const role = getRole()
  const isHq = role === 'HQ_STAFF'
  const id = idParam != null ? Number(idParam) : NaN

  const [product, setProduct] = useState<ProductListItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editCost, setEditCost] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editStatus, setEditStatus] = useState<ProductStatusValue>('ON_SALE')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    if (!Number.isFinite(id) || id < 1) {
      setError('잘못된 상품 번호입니다.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get<ProductListItem>(`/api/products/${id}`)
      const p = data ?? null
      setProduct(p)
      if (p) {
        setEditName(p.name)
        setEditPrice(String(p.price))
        setEditCost(String(p.cost))
        setEditDescription(p.description ?? '')
        setEditStatus(p.status)
      }
    } catch {
      setError('상품 정보를 불러오지 못했습니다.')
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const save = async () => {
    if (!product || !isHq || saving) return
    setSaveError(null)
    const p = Number.parseInt(editPrice.replace(/,/g, ''), 10)
    const c = Number.parseInt(editCost.replace(/,/g, ''), 10)
    if (!editName.trim()) {
      setSaveError('상품명을 입력하세요.')
      return
    }
    if (!Number.isFinite(p) || p < 0) {
      setSaveError('판매가를 올바르게 입력하세요.')
      return
    }
    if (!Number.isFinite(c) || c < 0) {
      setSaveError('원가를 올바르게 입력하세요.')
      return
    }
    setSaving(true)
    try {
      const desc = editDescription.trim()
      await api.put(`/api/products/${product.id}`, {
        name: editName.trim(),
        brandId: product.brandId,
        categoryId: product.categoryId,
        seasonId: product.seasonId,
        price: p,
        cost: c,
        status: editStatus,
        description: desc === '' ? null : desc,
      })
      await load()
    } catch (err) {
      if (isAxiosError(err)) {
        const d = err.response?.data as { message?: string } | string | undefined
        if (typeof d === 'string') setSaveError(d)
        else if (d && typeof d === 'object' && typeof d.message === 'string') setSaveError(d.message)
        else setSaveError('저장에 실패했습니다.')
      } else {
        setSaveError('저장에 실패했습니다.')
      }
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!product || !isHq || deleting) return
    if (!confirm(`「${product.name}」 상품을 삭제할까요? 이 작업은 되돌릴 수 없습니다.`)) return
    setDeleting(true)
    try {
      await api.delete(`/api/products/${product.id}`)
      navigate('/admin/products', { replace: true })
    } catch {
      setSaveError('삭제에 실패했습니다.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Link
          to="/admin/products"
          className="inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← 상품 목록
        </Link>
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="space-y-4">
        <Link
          to="/admin/products"
          className="inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← 상품 목록
        </Link>
        <p className="text-sm text-rose-600">{error ?? '상품을 찾을 수 없습니다.'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            to="/admin/products"
            className="inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            ← 상품 목록
          </Link>
          <h1 className="mt-2 text-lg font-semibold text-slate-900">{product.name}</h1>
          <p className="mt-1 text-sm text-slate-500">상품 ID {product.id}</p>
        </div>
        {isHq ? (
          <button
            type="button"
            onClick={() => void remove()}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 shadow-sm hover:bg-rose-100 disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
            {deleting ? '삭제 중…' : '상품 삭제'}
          </button>
        ) : null}
      </div>

      <SectionCard title="기본 정보">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-slate-500">브랜드</dt>
            <dd className="mt-0.5 text-slate-900">{product.brandName}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">카테고리</dt>
            <dd className="mt-0.5 text-slate-900">{product.categoryName}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">시즌</dt>
            <dd className="mt-0.5 text-slate-900">{product.seasonName}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">등록일</dt>
            <dd className="mt-0.5 text-slate-900">
              {product.createdAt ? new Date(product.createdAt).toLocaleString('ko-KR') : '—'}
            </dd>
          </div>
        </dl>
      </SectionCard>

      {isHq ? (
        <SectionCard title="상품 수정">
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              브랜드·카테고리·시즌은 API 제약으로 이 화면에서 바꾸지 않습니다.
            </p>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">상품명</span>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className={inputClass()}
                maxLength={200}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">판매가 (원)</span>
                <input
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className={inputClass()}
                  inputMode="numeric"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">원가 (원)</span>
                <input
                  value={editCost}
                  onChange={(e) => setEditCost(e.target.value)}
                  className={inputClass()}
                  inputMode="numeric"
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">상태</span>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as ProductStatusValue)}
                className={inputClass()}
              >
                {PRODUCT_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">설명</span>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="min-h-[88px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={3}
              />
            </label>
            {saveError ? <p className="text-sm text-rose-600">{saveError}</p> : null}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => void save()}
                disabled={saving}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:bg-blue-300"
              >
                {saving ? '저장 중…' : '변경 저장'}
              </button>
            </div>
          </div>
        </SectionCard>
      ) : (
        <SectionCard title="가격·상태">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-slate-500">판매가</dt>
              <dd className="mt-0.5 text-slate-900">{formatWon(product.price)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">원가</dt>
              <dd className="mt-0.5 text-slate-900">{formatWon(product.cost)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-slate-500">상태</dt>
              <dd className="mt-0.5 text-slate-900">{productStatusLabel(product.status)}</dd>
            </div>
            {product.description ? (
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium text-slate-500">설명</dt>
                <dd className="mt-0.5 whitespace-pre-wrap text-slate-800">{product.description}</dd>
              </div>
            ) : null}
          </dl>
        </SectionCard>
      )}
    </div>
  )
}
