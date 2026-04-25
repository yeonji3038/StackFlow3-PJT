export interface AllocationItem {
  id: number
  productOptionId: number
  skuCode: string
  productName: string
  color: string
  size: string
  quantity: number
}

export interface Allocation {
  id: number
  warehouseId: number
  warehouseName: string
  storeId: number
  storeName: string
  status: string
  requestedById: number
  requestedByName: string
  approvedById: number | null
  approvedByName: string | null
  /** 출고(ship) 처리한 창고 담당자 — 백엔드에서 채워 주면 표시 */
  shippedById?: number | null
  shippedByName?: string | null
  items: AllocationItem[]
  createdAt: string
  updatedAt: string
}

export interface WarehouseStock {
  id: number
  warehouseId: number
  warehouseName: string
  productOptionId: number
  skuCode: string
  productName: string
  color: string
  size: string
  quantity: number
}

export interface StoreStock {
  id: number
  storeId: number
  storeName: string
  productOptionId: number
  skuCode: string
  productName: string
  color: string
  size: string
  quantity: number
}

export interface WarehouseSummary {
  id: number
  name: string
}

export interface StoreSummary {
  id: number
  name: string
  location?: string
  /** 백엔드 `StoreType` JSON (Jackson 기본: camelCase `storeType`) */
  storeType?: string
  /** 일부 설정·게이트웨이에서 snake_case로 올 때 대비 */
  store_type?: string
}

export interface OrderItem {
  id: number
  productOptionId: number
  skuCode: string
  productName: string
  color: string
  size: string
  quantity: number
}

export interface Order {
  id: number
  storeId: number
  storeName: string
  status: string
  statusDescription?: string
  requestedById?: number
  requestedByName?: string
  approvedById?: number | null
  approvedByName?: string | null
  note?: string
  items: OrderItem[]
  createdAt?: string
  updatedAt?: string
}

export interface UserSummary {
  id: number
  email: string
  name: string
  role: string
  storeId: number | null
  storeName: string | null
  createdAt: string
}
