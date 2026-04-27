import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { api } from '../lib/api'
import { getRole, getStoreId } from '../lib/auth'
import { STOCK_EDIT_REASONS, canEditStoreStock } from '../lib/storeStockEdit'
import SectionCard from '../components/ui/SectionCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import type { StoreStock } from '../types/models'

function buildReasonPayload(preset: string, other: string): string | undefined {
  if (!preset) return undefined
  if (preset === '기타') {
    const t = other.trim()
    return t === '' ? '기타' : t
  }
  return preset
}

export default function StoreStockDetailPage() {
  const { storeId: storeIdParam, stockId: stockIdParam } = useParams()
  const role = getRole()
  const myStoreId = getStoreId()
  const storeId = storeIdParam != null ? Number(storeIdParam) : NaN
  const stockId = stockIdParam != null ? Number(stockIdParam) : NaN

  const [row, setRow] = useState<StoreStock | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editQty, setEditQty] = useState(0)
  const [reasonPreset, setReasonPreset] = useState('')
  const [reasonOther, setReasonOther] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const canEdit = canEditStoreStock(role, myStoreId, storeId)

  const load = useCallback(async () => {
    if (!Number.isFinite(storeId) || storeId < 1 || !Number.isFinite(stockId) || stockId < 1) {
      setError('잘못된 경로입니다.')
      setRow(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get<StoreStock[]>(`/api/stores/${storeId}/stocks`)
      const list = data ?? []
      const found = list.find((s) => s.id === stockId) ?? null
      setRow(found)
      if (found) {
        setEditQty(found.quantity)
        setReasonPreset('')
        setReasonOther('')
      } else {
        setError('해당 재고 행을 찾을 수 없습니다.')
      }
    } catch {
      setError('재고 정보를 불러오지 못했습니다.')
      setRow(null)
    } finally {
      setLoading(false)
    }
  }, [storeId, stockId])

  useEffect(() => {
    void load()
  }, [load])

  const bumpQty = (delta: number) => {
    setEditQty((prev) => Math.max(0, Math.floor(prev) + delta))
  }

  const save = async () => {
    if (!row || !canEdit || saving) return
    if (role === 'STORE_MANAGER' && (myStoreId == null || storeId !== myStoreId)) {
      setSaveError('본인 매장 재고만 수정할 수 있습니다.')
      return
    }
    const q = Math.floor(Number(editQty))
    if (!Number.isFinite(q) || q < 0) {
      setSaveError('수량은 0 이상의 정수로 입력하세요.')
      return
    }
    setSaveError(null)
    setSaving(true)
    try {
      const body: { quantity: number; reason?: string } = { quantity: q }
      const r = buildReasonPayload(reasonPreset, reasonOther)
      if (r) body.reason = r
      await api.put(`/api/stores/${storeId}/stocks/${row.id}`, body)
      await load()
    } catch (err) {
      if (isAxiosError(err)) {
        const d = err.response?.data as { message?: string } | string | undefined
        if (typeof d === 'string') setSaveError(d)
        else if (d && typeof d === 'object' && typeof d.message === 'string') setSaveError(d.message)
        else setSaveError('재고 수정에 실패했습니다.')
      } else {
        setSaveError('재고 수정에 실패했습니다.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Link
          to="/store-stock"
          className="inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← 매장 재고 목록
        </Link>
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !row) {
    return (
      <div className="space-y-4">
        <Link
          to="/store-stock"
          className="inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← 매장 재고 목록
        </Link>
        <p className="text-sm text-rose-600">{error ?? '재고를 찾을 수 없습니다.'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <Link
          to="/store-stock"
          className="inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← 매장 재고 목록
        </Link>
        <h1 className="mt-2 text-lg font-semibold text-slate-900">{row.productName}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {row.storeName} · SKU {row.skuCode}
        </p>
      </div>

      <SectionCard title="상품 정보">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium text-slate-500">상품명</dt>
            <dd className="mt-0.5 font-medium text-slate-900">{row.productName}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">SKU</dt>
            <dd className="mt-0.5 font-mono text-xs text-slate-800">{row.skuCode}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">색상</dt>
            <dd className="mt-0.5 text-slate-800">{row.color}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">사이즈</dt>
            <dd className="mt-0.5 text-slate-800">{row.size}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">현재 수량</dt>
            <dd className="mt-0.5 tabular-nums text-slate-900">{row.quantity}</dd>
          </div>
        </dl>
      </SectionCard>

      {canEdit ? (
        <SectionCard title="수량 수정">
          <div className="space-y-4">
            <div>
              <span className="mb-1 block text-xs font-medium text-slate-600">새 수량</span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => bumpQty(-1)}
                  disabled={saving}
                  className="h-10 w-10 shrink-0 rounded-md border border-slate-200 bg-white text-lg font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                >
                  −
                </button>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={editQty}
                  onChange={(e) => {
                    const v = e.target.value
                    if (v === '') {
                      setEditQty(0)
                      return
                    }
                    const n = Number.parseInt(v, 10)
                    setEditQty(Number.isFinite(n) && n >= 0 ? n : 0)
                  }}
                  disabled={saving}
                  className="h-10 w-28 rounded-md border border-slate-200 bg-white px-3 text-center text-sm font-medium tabular-nums shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => bumpQty(1)}
                  disabled={saving}
                  className="h-10 w-10 shrink-0 rounded-md border border-slate-200 bg-white text-lg font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">수정 사유 (선택)</span>
              <select
                value={reasonPreset}
                onChange={(e) => {
                  setReasonPreset(e.target.value)
                  if (e.target.value !== '기타') setReasonOther('')
                }}
                disabled={saving}
                className="h-10 w-full max-w-md rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              >
                {STOCK_EDIT_REASONS.map((o) => (
                  <option key={o.value === '' ? '_none' : o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            {reasonPreset === '기타' ? (
              <label className="block max-w-md">
                <span className="mb-1 block text-xs font-medium text-slate-600">기타 사유</span>
                <input
                  value={reasonOther}
                  onChange={(e) => setReasonOther(e.target.value)}
                  disabled={saving}
                  placeholder="사유를 입력하세요"
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                />
              </label>
            ) : null}

            {saveError ? <p className="text-sm text-rose-600">{saveError}</p> : null}

            <div className="flex justify-end gap-2 pt-2">
              <Link
                to="/store-stock"
                className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                취소
              </Link>
              <button
                type="button"
                onClick={() => void save()}
                disabled={saving}
                className="h-10 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:bg-blue-300"
              >
                {saving ? '저장 중…' : '저장'}
              </button>
            </div>
          </div>
        </SectionCard>
      ) : (
        <SectionCard title="수량">
          <p className="text-sm text-slate-600">
            이 매장 재고는 조회만 가능합니다. 수량 수정은 본사(HQ) 또는 해당 매장 관리자만 할 수 있습니다.
          </p>
          <p className="mt-2 text-lg font-semibold tabular-nums text-slate-900">{row.quantity}</p>
        </SectionCard>
      )}
    </div>
  )
}
