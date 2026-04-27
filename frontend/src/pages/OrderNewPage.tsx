import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { getRole, getStoreId } from '../lib/auth'
import SectionCard from '../components/ui/SectionCard'
import type { Order } from '../types/models'

type ItemRow = { productOptionId: string; quantity: string }

function parsePositiveInt(v: string): number | null {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : null
}

export default function OrderNewPage() {
  const navigate = useNavigate()
  const role = getRole()
  const storeId = getStoreId()

  const [note, setNote] = useState('')
  const [rows, setRows] = useState<ItemRow[]>([{ productOptionId: '', quantity: '1' }])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (role !== 'STORE_MANAGER') {
    return (
      <div className="space-y-4">
        <Link to="/orders" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          ← 발주 목록
        </Link>
        <p className="text-sm text-slate-600">발주 요청은 매장 관리자(STORE_MANAGER) 계정으로만 등록할 수 있습니다.</p>
      </div>
    )
  }

  if (storeId == null) {
    return (
      <div className="space-y-4">
        <Link to="/orders" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          ← 발주 목록
        </Link>
        <p className="text-sm text-amber-800">
          로그인 정보에 매장이 없습니다. 본사에 문의한 뒤 다시 로그인해 주세요.
        </p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const items: { productOptionId: number; quantity: number }[] = []
    for (const r of rows) {
      const pid = parsePositiveInt(r.productOptionId)
      if (pid == null) continue
      const q = Number(r.quantity)
      if (!Number.isFinite(q) || q < 1) {
        setError('각 품목의 옵션 ID와 수량을 확인해 주세요.')
        return
      }
      items.push({ productOptionId: pid, quantity: Math.floor(q) })
    }
    if (items.length === 0) {
      setError('품목을 한 줄 이상 입력해 주세요.')
      return
    }
    setSubmitting(true)
    try {
      const { data } = await api.post<Order>('/api/orders', {
        storeId,
        note: note.trim() || undefined,
        items,
      })
      const newId = data?.id
      if (newId != null) {
        navigate(`/orders/${newId}`, { replace: true })
      } else {
        navigate('/orders', { replace: true })
      }
    } catch {
      setError('등록에 실패했습니다. 권한·입력값을 확인해 주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link to="/orders" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          ← 발주 목록
        </Link>
        <h1 className="mt-2 text-lg font-semibold text-slate-900">발주 요청</h1>
        <p className="mt-1 text-sm text-slate-500">본인 매장으로 상품 옵션별 수량을 요청합니다.</p>
      </div>

      <SectionCard title="요청서">
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          {error && <p className="text-sm text-rose-600">{error}</p>}

          <div>
            <p className="text-sm text-slate-700">
              매장 ID <span className="font-mono font-medium text-slate-900">{storeId}</span>
            </p>
          </div>

          <label className="block text-sm font-medium text-slate-700">
            메모 (선택)
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>

          <div>
            <span className="text-sm font-medium text-slate-700">품목</span>
            <p className="mt-0.5 text-xs text-slate-500">상품 옵션 ID와 수량을 입력합니다.</p>
            <div className="mt-2 space-y-2">
              {rows.map((row, i) => (
                <div key={i} className="flex flex-wrap items-end gap-2">
                  <label className="text-xs text-slate-600">
                    <span className="mb-1 block font-medium text-slate-700">옵션 ID</span>
                    <input
                      type="number"
                      min={1}
                      value={row.productOptionId}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((r, j) => (j === i ? { ...r, productOptionId: e.target.value } : r)),
                        )
                      }
                      className="h-10 w-36 rounded-md border border-slate-200 bg-white px-2 text-sm"
                    />
                  </label>
                  <label className="text-xs text-slate-600">
                    <span className="mb-1 block font-medium text-slate-700">수량</span>
                    <input
                      type="number"
                      min={1}
                      value={row.quantity}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((r, j) => (j === i ? { ...r, quantity: e.target.value } : r)),
                        )
                      }
                      className="h-10 w-24 rounded-md border border-slate-200 bg-white px-2 text-sm"
                    />
                  </label>
                  {rows.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => setRows((prev) => prev.filter((_, j) => j !== i))}
                      className="text-xs font-medium text-rose-600 hover:underline"
                    >
                      삭제
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setRows((prev) => [...prev, { productOptionId: '', quantity: '1' }])}
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              + 품목 줄 추가
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:opacity-50"
            >
              요청하기
            </button>
            <Link
              to="/orders"
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
