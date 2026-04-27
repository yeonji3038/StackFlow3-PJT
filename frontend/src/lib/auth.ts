import axios from 'axios'
import { API_BASE_URL } from './apiBase'

export type UserRole = 'HQ_STAFF' | 'STORE_MANAGER' | 'WAREHOUSE_STAFF'

const REFRESH_KEY = 'refreshToken'

export function getToken(): string | null {
  return localStorage.getItem('token')
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY)
}

export function setRefreshToken(token: string | null): void {
  if (token) {
    localStorage.setItem(REFRESH_KEY, token)
  } else {
    localStorage.removeItem(REFRESH_KEY)
  }
}

/** 리프레시 토큰으로 액세스 토큰만 재발급 (성공 시 localStorage.token 갱신) */
export async function trySilentRefresh(): Promise<boolean> {
  const refresh = getRefreshToken()
  if (!refresh) return false
  try {
    const { data } = await axios.post<{ accessToken: string }>(
      `${API_BASE_URL}/api/auth/refresh`,
      {},
      { headers: { 'Refresh-Token': refresh } },
    )
    if (data?.accessToken) {
      localStorage.setItem('token', data.accessToken)
      return true
    }
    return false
  } catch {
    localStorage.removeItem('token')
    setRefreshToken(null)
    return false
  }
}

let refreshInFlight: Promise<boolean> | null = null

/** 동시 401 여러 건에서 리프레시 한 번만 호출 */
export function refreshAccessTokenSingleFlight(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = trySilentRefresh().finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}

export function getRole(): UserRole | null {
  const r = localStorage.getItem('role')
  if (r === 'HQ_STAFF' || r === 'STORE_MANAGER' || r === 'WAREHOUSE_STAFF') {
    return r
  }
  return null
}

export function getStoreId(): number | null {
  const v = localStorage.getItem('storeId')
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export function getWarehouseId(): number | null {
  const v = localStorage.getItem('warehouseId')
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/** 로그인 시 저장한 이메일(승인 API용 본인 조회 등) */
export function getUserEmail(): string | null {
  const v = localStorage.getItem('userEmail')
  return v != null && v !== '' ? v : null
}

/** 백엔드가 로그인 응답에 userId를 내려줄 때만 사용 */
export function getUserId(): number | null {
  const v = localStorage.getItem('userId')
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export function logout(): void {
  localStorage.removeItem('token')
  setRefreshToken(null)
  localStorage.removeItem('role')
  localStorage.removeItem('name')
  localStorage.removeItem('userEmail')
  localStorage.removeItem('userId')
  localStorage.removeItem('storeId')
  localStorage.removeItem('warehouseId')
}

export function roleLabel(role: UserRole): string {
  switch (role) {
    case 'HQ_STAFF':
      return '본사'
    case 'STORE_MANAGER':
      return '매장 관리자'
    case 'WAREHOUSE_STAFF':
      return '창고 담당'
    default:
      return role
  }
}
