import { create } from 'zustand'

export interface LowStockAlert {
  id: string
  skuCode: string
  warehouseName: string
  quantity: number
}

type StockState = {
  lowStockAlerts: LowStockAlert[]
  dashboardRefreshTrigger: number
  allocationRefreshTrigger: number
  pushLowStockAlert: (payload: Omit<LowStockAlert, 'id'>) => void
  removeLowStockAlert: (id: string) => void
  bumpDashboardRefresh: () => void
  bumpAllocationRefresh: () => void
}

export const useStockStore = create<StockState>((set) => ({
  lowStockAlerts: [],
  dashboardRefreshTrigger: 0,
  allocationRefreshTrigger: 0,
  pushLowStockAlert: (payload) =>
    set((s) => ({
      lowStockAlerts: [...s.lowStockAlerts, { ...payload, id: crypto.randomUUID() }],
    })),
  removeLowStockAlert: (id) =>
    set((s) => ({
      lowStockAlerts: s.lowStockAlerts.filter((a) => a.id !== id),
    })),
  bumpDashboardRefresh: () =>
    set((s) => ({ dashboardRefreshTrigger: s.dashboardRefreshTrigger + 1 })),
  bumpAllocationRefresh: () =>
    set((s) => ({ allocationRefreshTrigger: s.allocationRefreshTrigger + 1 })),
}))
