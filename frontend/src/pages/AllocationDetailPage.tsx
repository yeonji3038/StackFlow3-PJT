import { Fragment, useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Building2, CircleCheck, Package, Truck } from 'lucide-react'
import { api } from '../lib/api'
import { allocationStatusLabel } from '../lib/allocationLabels'
import { getOrResolveApprovedByUserId } from '../lib/resolveCurrentUserId'
import { getRole, getStoreId, getWarehouseId } from '../lib/auth'
import SectionCard from '../components/ui/SectionCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import type { Allocation } from '../types/models'

const FLOW_STEPS = [
  { label: '이동 요청', Icon: Building2 },
  { label: '상품 이동중', Icon: Package },
  { label: '출고 완료', Icon: Truck },
  { label: '입고 완료', Icon: CircleCheck },
] as const

function allocationFlowStepIndex(status: string): number {
  switch (status) {
    case 'REQUESTED':
      return 0
    case 'APPROVED':
      return 1
    case 'SHIPPED':
      return 2
    case 'RECEIVED':
      return 3
    default:
      return 0
  }
}

function flowStepVisual(
  index: number,
  status: string,
  activeIndex: number,
): 'done' | 'current' | 'pending' | 'cancelled' {
  if (status === 'CANCELLED') return 'cancelled'
  if (status === 'RECEIVED') return 'done'
  if (index < activeIndex) return 'done'
  if (index === activeIndex) return 'current'
  return 'pending'
}

function apiErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const data = (err as { response?: { data?: { message?: string } } }).response?.data
    if (data?.message) return String(data.message)
  }
  return fallback
}

export default function AllocationDetailPage() {
  const { id: idParam } = useParams()
  const role = getRole()
  const id = idParam != null ? Number(idParam) : NaN

  const [allocation, setAllocation] = useState<Allocation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [acting, setActing] = useState(false)

  const load = useCallback(async () => {
    if (!Number.isFinite(id) || id < 1) {
      setError('잘못된 배분 번호입니다.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get<Allocation>(`/api/allocations/${id}`)
      setAllocation(data ?? null)
    } catch {
      setError('배분 정보를 불러오지 못했습니다.')
      setAllocation(null)
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
      if (e instanceof Error && e.message) {
        setActionError(e.message)
      } else {
        setActionError(apiErrorMessage(e, '처리에 실패했습니다.'))
      }
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
      await api.patch<Allocation>(`/api/allocations/${id}/approve`, null, {
        params: { approvedById },
      })
    })
  }

  const handleReject = () => {
    if (!window.confirm('이 배분 요청을 반려(취소)할까요?')) return
    void runAction(async () => {
      await api.patch<Allocation>(`/api/allocations/${id}/cancel`)
    })
  }

  const handleShip = () => {
    void runAction(async () => {
      await api.patch<Allocation>(`/api/allocations/${id}/ship`)
    })
  }

  const handleReceive = () => {
    void runAction(async () => {
      await api.patch<Allocation>(`/api/allocations/${id}/receive`)
    })
  }

  const isHq = role === 'HQ_STAFF'
  const isWarehouse = role === 'WAREHOUSE_STAFF'
  const isStore = role === 'STORE_MANAGER'

  if (loading) {
    return <LoadingSpinner />
  }

  if (error || !allocation) {
    return (
      <div className="space-y-4">
        <Link to="/allocations" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          ← 배분 목록
        </Link>
        <p className="text-sm text-rose-600">{error ?? '데이터가 없습니다.'}</p>
      </div>
    )
  }

  const st = allocation.status
  const myStoreId = getStoreId()
  const myWarehouseId = getWarehouseId()

  const showHqApproveReject = isHq && st === 'REQUESTED'
  const showWarehouseShip =
    isWarehouse &&
    st === 'APPROVED' &&
    (myWarehouseId == null || allocation.warehouseId === myWarehouseId)
  const showStoreReceive =
    isStore &&
    st === 'SHIPPED' &&
    myStoreId != null &&
    allocation.storeId === myStoreId

  const flowIdx = allocationFlowStepIndex(st)
  const storeName = allocation.storeName ?? '해당 매장'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/allocations" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            ← 배분 목록
          </Link>
          <h1 className="mt-2 text-lg font-semibold text-slate-900">
            배분 <span className="font-mono text-slate-600">#{allocation.id}</span>
          </h1>
        </div>
        <span className="rounded-md bg-slate-100 px-3 py-1 text-sm font-medium text-slate-800 ring-1 ring-slate-200">
          {allocationStatusLabel(st)}
        </span>
      </div>

      {actionError && (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{actionError}</p>
      )}

      <section className="rounded-xl border border-slate-200 bg-white px-2 py-5 shadow-sm sm:px-4 sm:py-6">
        {st === 'CANCELLED' ? (
          <p className="text-center text-sm font-medium text-rose-700">취소된 배분입니다.</p>
        ) : (
          <>
            <div className="flex w-full max-w-3xl items-start justify-center sm:mx-auto">
              {FLOW_STEPS.map((step, i) => {
                const visual = flowStepVisual(i, st, flowIdx)
                const Icon = step.Icon
                const circle =
                  visual === 'cancelled'
                    ? 'border-slate-200 bg-slate-100 text-slate-400'
                    : visual === 'done'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : visual === 'current'
                        ? 'border-blue-600 bg-blue-600 text-white ring-2 ring-blue-200'
                        : 'border-slate-200 bg-white text-slate-400'
                return (
                  <Fragment key={step.label}>
                    {i > 0 ? (
                      <div
                        className={`mt-[22px] h-0.5 min-w-[8px] flex-1 sm:mt-[22px] ${
                          flowIdx > i - 1 ? 'bg-blue-500' : 'bg-slate-200'
                        }`}
                        aria-hidden
                      />
                    ) : null}
                    <div className="flex w-[5.25rem] shrink-0 flex-col items-center gap-1 sm:w-28">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-full border-2 ${circle}`}
                      >
                        <Icon className="h-5 w-5 shrink-0" aria-hidden />
                      </div>
                      <span
                        className={`text-center text-[11px] font-medium leading-tight sm:text-xs ${
                          visual === 'current' || visual === 'done' ? 'text-slate-900' : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </span>
                      {st === 'SHIPPED' && i === 2 ? (
                        <p className="text-center text-[11px] font-semibold leading-snug text-blue-900 sm:text-xs">
                          {storeName} 입고 대기
                        </p>
                      ) : null}
                      {st === 'RECEIVED' && i === 3 ? (
                        <p className="text-center text-[11px] font-semibold leading-snug text-blue-900 sm:text-xs">
                          {storeName} 입고 완료
                        </p>
                      ) : null}
                    </div>
                  </Fragment>
                )
              })}
            </div>
          </>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">창고</dt>
            <dd className="font-medium text-slate-900">{allocation.warehouseName}</dd>
          </div>
          <div>
            <dt className="text-slate-500">매장</dt>
            <dd className="font-medium text-slate-900">{allocation.storeName}</dd>
          </div>
          <div>
            <dt className="text-slate-500">요청자</dt>
            <dd className="text-slate-900">{allocation.requestedByName}</dd>
          </div>
          <div>
            <dt className="text-slate-500">승인자</dt>
            <dd className="text-slate-900">{allocation.approvedByName ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-slate-500">출고 담당</dt>
            <dd className="text-slate-900">{allocation.shippedByName ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-slate-500">등록일</dt>
            <dd className="text-slate-800">
              {allocation.createdAt ? new Date(allocation.createdAt).toLocaleString('ko-KR') : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">수정일</dt>
            <dd className="text-slate-800">
              {allocation.updatedAt ? new Date(allocation.updatedAt).toLocaleString('ko-KR') : '—'}
            </dd>
          </div>
        </dl>
      </section>

      {showHqApproveReject && (
        <SectionCard title="처리">
          <p className="mb-4 text-sm text-slate-600">요청된 배분에 대해 승인 또는 반려(취소)할 수 있습니다.</p>
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
      )}

      {showWarehouseShip && (
        <SectionCard title="출고">
          <p className="mb-4 text-sm text-slate-600">승인된 배분을 창고에서 출고 처리합니다.</p>
          <button
            type="button"
            disabled={acting}
            onClick={() => void handleShip()}
            className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow hover:bg-slate-900 disabled:opacity-50"
          >
            출고 처리
          </button>
        </SectionCard>
      )}

      {isWarehouse && st === 'REQUESTED' && (
        <p className="text-sm text-slate-500">본사 승인 후 출고 처리 버튼이 활성화됩니다.</p>
      )}

      {isWarehouse && st === 'APPROVED' && !showWarehouseShip && (
        <p className="text-sm text-slate-500">이 배분은 다른 창고 건입니다. 담당 창고 배분만 출고할 수 있습니다.</p>
      )}

      {showStoreReceive && (
        <SectionCard title="매장 입고">
          <p className="mb-4 text-sm text-slate-600">
            물품을 받으셨다면 입고 완료로 상태를 갱신해 주세요.
          </p>
          <button
            type="button"
            disabled={acting}
            onClick={() => void handleReceive()}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-emerald-700 disabled:opacity-50"
          >
            입고 완료
          </button>
        </SectionCard>
      )}

      {isStore && st === 'SHIPPED' && !showStoreReceive && (
        <p className="text-sm text-slate-500">
          이 배분은 다른 매장 건입니다. 입고 완료는 해당 매장 관리자 계정에서 처리합니다.
        </p>
      )}

      <SectionCard title="품목">
        {(allocation.items ?? []).length === 0 ? (
          <p className="text-sm text-slate-500">등록된 품목이 없습니다.</p>
        ) : (
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
                {(allocation.items ?? []).map((it) => (
                  <tr key={it.id} className="border-b border-slate-100 even:bg-slate-50/40">
                    <td className="px-3 py-2 font-mono text-xs text-slate-700">{it.skuCode}</td>
                    <td className="px-3 py-2 text-slate-800">{it.productName}</td>
                    <td className="px-3 py-2 text-slate-700">{it.color}</td>
                    <td className="px-3 py-2 text-slate-700">{it.size}</td>
                    <td className="px-3 py-2 text-right tabular-nums font-medium text-slate-900">{it.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  )
}
