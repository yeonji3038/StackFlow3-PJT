import type { UserRole } from './auth'

export const STOCK_EDIT_REASONS = [
  { value: '', label: '선택 안 함' },
  { value: '판매', label: '판매' },
  { value: '불량', label: '불량' },
  { value: '분실', label: '분실' },
  { value: '시즌종료', label: '시즌종료' },
  { value: '기타', label: '기타' },
] as const

/** HQ는 모든 매장, 매장 관리자는 본인 매장만 수량 수정 가능 */
export function canEditStoreStock(
  role: UserRole | null,
  myStoreId: number | null,
  storeId: number,
): boolean {
  if (!Number.isFinite(storeId)) return false
  if (role === 'HQ_STAFF') return true
  if (role === 'STORE_MANAGER' && myStoreId != null && storeId === myStoreId) return true
  return false
}
