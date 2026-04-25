import { api } from './api'
import { getUserEmail, getUserId } from './auth'
import type { UserSummary } from '../types/models'

/**
 * 배분 승인 API가 요구하는 `approvedById`용.
 * 로그인 응답에 userId가 없을 때(현재 백엔드) `/api/users`에서 이메일로 본인 행을 찾습니다.
 */
export async function resolveCurrentUserId(): Promise<number | null> {
  const email = getUserEmail()
  if (!email) return null
  const { data } = await api.get<UserSummary[]>('/api/users')
  const me = (data ?? []).find((u) => u.email === email)
  return me?.id ?? null
}

/** `PATCH .../approve`용: 저장된 userId 우선, 없으면 사용자 목록으로 해석 */
export async function getOrResolveApprovedByUserId(): Promise<number | null> {
  const fromLogin = getUserId()
  if (fromLogin != null) return fromLogin
  return resolveCurrentUserId()
}
