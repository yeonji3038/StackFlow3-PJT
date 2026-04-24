import { useEffect, useMemo, useState } from 'react'
import { Trash2, Pencil } from 'lucide-react'
import { api } from '../../lib/api'
import { getRole } from '../../lib/auth'
import SectionCard from '../../components/ui/SectionCard'
import TablePaginationBar from '../../components/ui/TablePaginationBar'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Modal from '../../components/ui/Modal'
import { useTablePagination } from '../../hooks/useTablePagination'
import type { StoreSummary, UserSummary } from '../../types/models'

type Editable = {
  id: number
  email: string
  name: string
  role: 'HQ_STAFF' | 'STORE_MANAGER' | 'WAREHOUSE_STAFF' | 'STAFF'
  storeId: number | null
}

export default function UsersAdminPage() {
  const role = getRole()
  const [users, setUsers] = useState<UserSummary[]>([])
  const [stores, setStores] = useState<StoreSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [q, setQ] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL' | Editable['role']>('ALL')
  const [storeFilter, setStoreFilter] = useState<number | 'ALL'>('ALL')

  const [editing, setEditing] = useState<Editable | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const [u, s] = await Promise.all([
          api.get<UserSummary[]>('/api/users'),
          api.get<StoreSummary[]>('/api/stores').catch(() => ({ data: [] as StoreSummary[] })),
        ])
        if (cancelled) return
        setUsers(u.data ?? [])
        setStores(s.data ?? [])
      } catch {
        if (!cancelled) setError('사용자 목록을 불러오지 못했습니다.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const storeOptions = useMemo(() => {
    const map = new Map<number, string>()
    for (const s of stores) map.set(s.id, s.name)
    for (const u of users) {
      if (u.storeId != null && u.storeName) map.set(u.storeId, u.storeName)
    }
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1], 'ko-KR'))
  }, [stores, users])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return users
      .filter((u) => {
        if (roleFilter !== 'ALL' && u.role !== roleFilter) return false
        if (storeFilter !== 'ALL' && u.storeId !== storeFilter) return false
        if (!needle) return true
        const hay = [u.email, u.name, u.role, u.storeName ?? ''].join(' ').toLowerCase()
        return hay.includes(needle)
      })
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }, [users, q, roleFilter, storeFilter])

  const userPagination = useTablePagination(filtered)

  const openEdit = (u: UserSummary) => {
    setEditing({
      id: u.id,
      email: u.email,
      name: u.name,
      role: (u.role as Editable['role']) ?? 'STAFF',
      storeId: u.storeId ?? null,
    })
  }

  const reloadUsers = async () => {
    const { data } = await api.get<UserSummary[]>('/api/users')
    setUsers(data ?? [])
  }

  const saveEdit = async () => {
    if (!editing || saving) return
    setSaving(true)
    try {
      await api.put(`/api/users/${editing.id}`, {
        // 백엔드 UserRequestDto 기준
        email: editing.email, // @Valid 때문에 필요할 수 있어 포함
        password: '********', // 서버가 비밀번호를 요구하면 실패할 수 있어, 일단 placeholder
        name: editing.name,
        role: editing.role,
        storeId: editing.role === 'STORE_MANAGER' ? editing.storeId : null,
      })
      await reloadUsers()
      setEditing(null)
    } catch {
      // UserRequestDto에 email/password가 필수라서 PUT에서 실패할 가능성이 큼.
      // 백엔드가 "수정용 DTO"로 분리되면 이 부분은 password/email 없이도 동작하도록 바꾸면 됨.
      setError('수정에 실패했습니다. (백엔드 수정 DTO가 필요할 수 있습니다.)')
    } finally {
      setSaving(false)
    }
  }

  const deleteUser = async (id: number) => {
    if (!confirm('정말 삭제할까요?')) return
    try {
      await api.delete(`/api/users/${id}`)
      await reloadUsers()
    } catch {
      setError('삭제에 실패했습니다.')
    }
  }

  if (role !== 'HQ_STAFF') {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-semibold text-slate-900">사용자 관리</h1>
        <p className="text-sm text-slate-500">본사(HQ) 권한에서만 접근할 수 있습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">사용자 관리</h1>
        <p className="mt-1 text-sm text-slate-500">매장 관리자/창고 담당자 정보를 조회·수정·삭제합니다.</p>
      </div>

      <SectionCard
        title="사용자 목록"
        description="검색/필터 후 사용자를 선택해 수정하세요."
        headerRight={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="이름/이메일/역할/매장 검색"
              className="h-9 w-64 rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <label className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">역할</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
                className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">전체</option>
                <option value="STORE_MANAGER">매장 관리자</option>
                <option value="WAREHOUSE_STAFF">창고 담당</option>
                <option value="HQ_STAFF">본사</option>
                <option value="STAFF">직원</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">매장</span>
              <select
                value={storeFilter === 'ALL' ? 'ALL' : String(storeFilter)}
                onChange={(e) => {
                  const v = e.target.value
                  setStoreFilter(v === 'ALL' ? 'ALL' : Number(v))
                }}
                className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">전체</option>
                {storeOptions.map(([id, name]) => (
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
                setRoleFilter('ALL')
                setStoreFilter('ALL')
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
        ) : error ? (
          <p className="text-sm text-rose-600">{error}</p>
        ) : (
          <div>
            <div className="overflow-x-auto rounded-md border border-slate-100">
              <div className="max-h-[min(28rem,calc(100vh-14rem))] overflow-y-auto">
                <table className="w-full min-w-[980px] border-collapse text-sm">
                  <thead>
                    <tr className="sticky top-0 z-[1] border-b border-slate-200 bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                      <th className="px-3 py-2.5">ID</th>
                      <th className="px-3 py-2.5">이메일</th>
                      <th className="px-3 py-2.5">이름</th>
                      <th className="px-3 py-2.5">역할</th>
                      <th className="px-3 py-2.5">매장</th>
                      <th className="px-3 py-2.5">가입일</th>
                      <th className="px-3 py-2.5 text-right">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-3 py-12 text-center text-slate-400">
                          조건에 맞는 사용자가 없습니다.
                        </td>
                      </tr>
                    ) : (
                      userPagination.pageItems.map((u) => (
                        <tr
                          key={u.id}
                          className="border-b border-slate-100 even:bg-slate-50/40 hover:bg-blue-50/50"
                        >
                          <td className="px-3 py-2 font-mono text-xs text-slate-600">{u.id}</td>
                          <td className="px-3 py-2 text-slate-800">{u.email}</td>
                          <td className="px-3 py-2 text-slate-800">{u.name}</td>
                          <td className="px-3 py-2 text-slate-700">{u.role}</td>
                          <td className="px-3 py-2 text-slate-700">{u.storeName ?? '—'}</td>
                          <td className="px-3 py-2 text-xs text-slate-500">
                            {u.createdAt ? new Date(u.createdAt).toLocaleString('ko-KR') : '—'}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openEdit(u)}
                                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                              >
                                <Pencil className="h-3.5 w-3.5" aria-hidden />
                                수정
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteUser(u.id)}
                                className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 shadow-sm hover:bg-rose-100"
                              >
                                <Trash2 className="h-3.5 w-3.5" aria-hidden />
                                삭제
                              </button>
                            </div>
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
                page={userPagination.page}
                pageCount={userPagination.pageCount}
                total={userPagination.total}
                setPage={userPagination.setPage}
                fromIdx={userPagination.fromIdx}
                toIdx={userPagination.toIdx}
              />
            </div>
          </div>
        )}
      </SectionCard>

      <Modal
        open={editing != null}
        onClose={() => setEditing(null)}
        title={editing ? `${editing.name} 수정` : '수정'}
        description={editing ? editing.email : undefined}
      >
        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">이름</label>
              <input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">역할</label>
              <select
                value={editing.role}
                onChange={(e) =>
                  setEditing({ ...editing, role: e.target.value as Editable['role'], storeId: null })
                }
                className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="HQ_STAFF">본사 (HQ_STAFF)</option>
                <option value="STORE_MANAGER">매장 관리자 (STORE_MANAGER)</option>
                <option value="WAREHOUSE_STAFF">창고 담당 (WAREHOUSE_STAFF)</option>
                <option value="STAFF">직원 (STAFF)</option>
              </select>
              <p className="mt-1 text-xs text-slate-500">
                창고 담당은 현재 백엔드 스펙상 별도 창고 ID 연결이 없습니다.
              </p>
            </div>

            {editing.role === 'STORE_MANAGER' ? (
              <div>
                <label className="block text-sm font-medium text-slate-700">매장</label>
                <select
                  value={editing.storeId == null ? '' : String(editing.storeId)}
                  onChange={(e) => setEditing({ ...editing, storeId: e.target.value ? Number(e.target.value) : null })}
                  className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">선택</option>
                  {storeOptions.map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="h-10 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={saveEdit}
                disabled={saving}
                className="h-10 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:bg-blue-300"
              >
                {saving ? '저장 중…' : '저장'}
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

