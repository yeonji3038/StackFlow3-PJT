import { getRole } from '../lib/auth'
import HQDashboard from './dashboard/HQDashboard'
import StoreManagerDashboard from './dashboard/StoreManagerDashboard'
import WarehouseStaffDashboard from './dashboard/WarehouseStaffDashboard'

export default function DashboardHome() {
  const role = getRole()

  if (role === 'STORE_MANAGER') {
    return <StoreManagerDashboard />
  }
  if (role === 'WAREHOUSE_STAFF') {
    return <WarehouseStaffDashboard />
  }
  return <HQDashboard />
}
