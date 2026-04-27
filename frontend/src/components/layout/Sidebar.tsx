import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  PackagePlus,
  ShoppingCart,
  Warehouse,
  Store,
  History,
  Users,
  LogOut,
  Boxes,
  Tag,
} from 'lucide-react'
import { getRole, logout, roleLabel } from '../../lib/auth'

const nav = [
  { to: '/dashboard', label: '대시보드', icon: LayoutDashboard },
  { to: '/orders', label: '발주 관리', icon: ShoppingCart },
  { to: '/warehouse-stock', label: '창고 재고', icon: Warehouse },
  { to: '/store-stock', label: '매장 재고', icon: Store },
  { to: '/movements', label: '입출고 이력', icon: History },
] as const

export default function Sidebar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const name = localStorage.getItem('name') ?? '사용자'
  const role = getRole()
  const isHq = role === 'HQ_STAFF'

  const allocationsManageActive =
    pathname === '/allocations' || /^\/allocations\/\d+$/.test(pathname)
  const allocationNewActive = pathname === '/allocations/new'
  const allocationSectionActive = allocationsManageActive || allocationNewActive

  const [allocHover, setAllocHover] = useState(false)
  const [allocFocusInside, setAllocFocusInside] = useState(false)
  const showAllocSub = allocHover || allocationNewActive || allocFocusInside

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-slate-50">
      <div className="border-b border-slate-200 px-4 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
            <Boxes className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-slate-900">StockFlow</p>
            <p className="text-xs text-slate-500">재고관리</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200/80'
                  : 'text-slate-600 hover:bg-white/80 hover:text-slate-900',
              ].join(' ')
            }
          >
            <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
            {label}
          </NavLink>
        ))}

        {isHq ? (
          <div
            className={[
              'rounded-lg transition-colors',
              allocationSectionActive ? 'bg-white shadow-sm ring-1 ring-slate-200/80' : '',
            ].join(' ')}
            onMouseEnter={() => setAllocHover(true)}
            onMouseLeave={() => setAllocHover(false)}
            onFocusCapture={() => setAllocFocusInside(true)}
            onBlurCapture={(e) => {
              const next = e.relatedTarget as Node | null
              if (!e.currentTarget.contains(next)) setAllocFocusInside(false)
            }}
          >
            <NavLink
              to="/allocations"
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive || allocationNewActive
                    ? 'text-blue-700'
                    : 'text-slate-600 hover:bg-white/80 hover:text-slate-900',
                ].join(' ')
              }
            >
              <Package className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
              배분 관리
            </NavLink>
            {showAllocSub ? (
              <div className="space-y-0.5 pb-1 pl-3">
                <div className="ml-3 border-l border-slate-200 pl-2">
                  <NavLink
                    to="/allocations/new"
                    className={({ isActive }) =>
                      [
                        'flex items-center gap-3 rounded-lg py-2 pl-2 pr-3 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-slate-50 text-blue-700 ring-1 ring-slate-200/80'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                      ].join(' ')
                    }
                  >
                    <PackagePlus className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                    배분 생성
                  </NavLink>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <NavLink
            to="/allocations"
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                allocationsManageActive || isActive
                  ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200/80'
                  : 'text-slate-600 hover:bg-white/80 hover:text-slate-900',
              ].join(' ')
            }
          >
            <Package className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
            배분 관리
          </NavLink>
        )}

        {isHq ? (
          <>
            <NavLink
              to="/admin/products"
              className={({ isActive }) =>
                [
                  'mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200/80'
                    : 'text-slate-600 hover:bg-white/80 hover:text-slate-900',
                ].join(' ')
              }
            >
              <Tag className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
              상품 등록
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200/80'
                    : 'text-slate-600 hover:bg-white/80 hover:text-slate-900',
                ].join(' ')
              }
            >
              <Users className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
              사용자 관리
            </NavLink>
          </>
        ) : null}
      </nav>

      <div className="border-t border-slate-200 bg-slate-100/80 p-4">
        <div className="mb-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <p className="truncate text-sm font-medium text-slate-900">{name}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {role ? roleLabel(role) : '역할 없음'}
          </p>
          <p className="mt-2 text-[11px] text-slate-400">
            {new Date().toLocaleDateString('ko-KR', {
              weekday: 'short',
              month: 'numeric',
              day: 'numeric',
            })}
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          로그아웃
        </button>
      </div>
    </aside>
  )
}
