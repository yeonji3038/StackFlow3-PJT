import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { getOrResolveApprovedByUserId } from '../lib/resolveCurrentUserId'
import { getRole, getStoreId } from '../lib/auth'
import { orderStatusDisplayText } from '../lib/orderLabels'
import SectionCard from '../components/ui/SectionCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import type { Order } from '../types/models'

function apiErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const data = (err as { response?: { data?: { message?: string } } }).response?.data
    if (data?.message) return String(data.message)
  }
  return fallback
}

export default function OrderDetailPage() {
  const { id: idParam } = useParams()
  const role = getRole()
  const myStoreId = getStoreId()
  const id = idParam != null ? Number(idParam) : NaN

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [acting, setActing] = useState(false)

  const load = useCallback(async () => {
    if (!Number.isFinite(id) || id < 1) {
      setError('잘못된 발주 번호입니다.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get<Order>(`/api/orders/${id}`)
      setOrder(data ?? null)
    } catch {
      setError('발주 정보를 불러오지 못했습니다.')
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const runAction = async (fn: () => Promise<void>) => {
    setActionError(null)
    setActing(true)
    try {
      await fn()
      await load()
    } catch (e) {
      setActionError(apiErrorMessage(e, '처리에 실패했습니다.'))
    } finally {
      setActing(false)
    }
  }

  const handleApprove = () => {
    void runAction(async () => {
      const approvedById = await getOrResolveApprovedByUserId()
      if (approvedById == null) {
        throw new Error('로그인 사용자를 확인할 수 없습니다. 다시 로그인해 주세요.')
      }
      await api.patch<Order>(`/api/orders/${id}/approve`, null, {
        params: { approvedById },
      })
    })
  }

  const handleReject = () => {
    if (!window.confirm('이 발주를 반려할까요?')) return
    void runAction(async () => {
      const approvedById = await getOrResolveApprovedByUserId()
      if (approvedById == null) {
        throw new Error('로그인 사용자를 확인할 수 없습니다. 다시 로그인해 주세요.')
      }
      await api.patch<Order>(`/api/orders/${id}/reject`, null, {
        params: { approvedById },
      })
    })
  }

  const handleShip = () => {
    void runAction(async () => {
      await api.patch<Order>(`/api/orders/${id}/ship`)
    })
  }

  const handleReceive = () => {
    void runAction(async () => {
      await api.patch<Order>(`/api/orders/${id}/receive`)
    })
  }

  const isHq = role === 'HQ_STAFF'
  const isWarehouse = role === 'WAREHOUSE_STAFF'
  const isStore = role === 'STORE_MANAGER'

  if (loading) {
    return (
      <div className="space-y-4">
        <Link to="/orders" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          ← 발주 목록
        </Link>
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <Link to="/orders" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          ← 발주 목록
        </Link>
        <p className="text-sm text-rose-600">{error ?? '데이터가 없습니다.'}</p>
      </div>
    )
  }

  const st = order.status
  const showHqApproveReject = isHq && st === 'REQUESTED'
  const showWarehouseShip = isWarehouse && st === 'APPROVED'
  const showStoreReceive =
    isStore &&
    st === 'SHIPPED' &&
    myStoreId != null &&
    order.storeId === myStoreId

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/orders" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            ← 발주 목록
          </Link>
          <h1 className="mt-2 text-lg font-semibold text-slate-900">발주 #{order.id}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {order.storeName} · {orderStatusDisplayText(order)}
          </p>
        </div>
      </div>

      {actionError ? (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{actionError}</p>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">매장</dt>
            <dd className="font-medium text-slate-900">{order.storeName}</dd>
          </div>
          <div>
            <dt className="text-slate-500">상태</dt>
            <dd className="text-slate-900">{orderStatusDisplayText(order)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">요청자</dt>
            <dd className="text-slate-900">{order.requestedByName ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-slate-500">승인자</dt>
            <dd className="text-slate-900">{order.approvedByName ?? '—'}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-slate-500">메모</dt>
            <dd className="text-slate-800">{order.note?.trim() ? order.note : '—'}</dd>
          </div>
          <div>
            <dt className="text-slate-500">등록일</dt>
            <dd className="text-slate-800">
              {order.createdAt ? new Date(order.createdAt).toLocaleString('ko-KR') : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">수정일</dt>
            <dd className="text-slate-800">
              {order.updatedAt ? new Date(order.updatedAt).toLocaleString('ko-KR') : '—'}
            </dd>
          </div>
        </dl>
      </section>

      {showHqApproveReject ? (
        <SectionCard title="처리">
          <p className="mb-4 text-sm text-slate-600">요청된 발주를 승인하거나 반려할 수 있습니다.</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={acting}
              onClick={() => void handleApprove()}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:opacity-50"
            >
              승인
            </button>
            <button
              type="button"
              disabled={acting}
              onClick={() => void handleReject()}
              className="rounded-md border border-rose-300 bg-white px-4 py-2 text-sm font-medium text-rose-700 shadow-sm hover:bg-rose-50 disabled:opacity-50"
            >
              반려
            </button>
          </div>
        </SectionCard>
      ) : null}

      {showWarehouseShip ? (
        <SectionCard title="출고">
          <p className="mb-4 text-sm text-slate-600">승인된 발주를 출고 처리합니다.</p>
          <button
            type="button"
            disabled={acting}
            onClick={() => void handleShip()}
            className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow hover:bg-slate-900 disabled:opacity-50"
          >
            출고
          </button>
        </SectionCard>
      ) : null}

      {showStoreReceive ? (
        <SectionCard title="입고">
          <p className="mb-4 text-sm text-slate-600">매장 입고를 완료 처리합니다.</p>
          <button
            type="button"
            disabled={acting}
            onClick={() => void handleReceive()}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-emerald-700 disabled:opacity-50"
          >
            입고완료
          </button>
        </SectionCard>
      ) : null}

      <SectionCard title="발주 품목">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2">SKU</th>
                <th className="px-3 py-2">상품</th>
                <th className="px-3 py-2">색상</th>
                <th className="px-3 py-2">사이즈</th>
                <th className="px-3 py-2 text-right">수량</th>
              </tr>
            </thead>
            <tbody>
              {(order.items ?? []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-slate-400">
                    품목이 없습니다.
                  </td>
                </tr>
              ) : (
                (order.items ?? []).map((it) => (
                  <tr key={it.id} className="border-b border-slate-100 even:bg-slate-50/40">
                    <td className="px-3 py-2 font-mono text-xs text-slate-600">{it.skuCode}</td>
                    <td className="px-3 py-2 text-slate-800">{it.productName}</td>
                    <td className="px-3 py-2 text-slate-700">{it.color}</td>
                    <td className="px-3 py-2 text-slate-700">{it.size}</td>
                    <td className="px-3 py-2 text-right font-medium tabular-nums text-slate-900">{it.quantity}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  )
}
