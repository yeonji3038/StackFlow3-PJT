import { api } from './api'
import { getWarehouseId } from './auth'
import type { WarehouseSummary } from '../types/models'

export async function resolveDefaultWarehouseId(): Promise<number | null> {
  const fromLs = getWarehouseId()
  if (fromLs != null) return fromLs
  const { data } = await api.get<WarehouseSummary[]>('/api/warehouses')
  if (Array.isArray(data) && data.length > 0) {
    return data[0].id
  }
  return null
}
