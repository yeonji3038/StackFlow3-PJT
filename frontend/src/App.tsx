import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import WebSocketBridge from './components/global/WebSocketBridge'
import LowStockToaster from './components/global/LowStockToaster'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage.tsx'
import AuthLayout from './components/layout/AuthLayout'
import DashboardHome from './pages/DashboardHome'
import AllocationsPage from './pages/AllocationsPage'
import AllocationDetailPage from './pages/AllocationDetailPage'
import AllocationNewPage from './pages/AllocationNewPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import OrderNewPage from './pages/OrderNewPage'
import WarehouseStockPage from './pages/WarehouseStockPage'
import StoreStockPage from './pages/StoreStockPage'
import StoreStockDetailPage from './pages/StoreStockDetailPage'
import MovementsPage from './pages/MovementsPage'
import UsersAdminPage from './pages/admin/UsersAdminPage'
import ProductListPage from './pages/admin/products/ProductListPage'
import ProductRegisterPage from './pages/admin/products/ProductRegisterPage'
import ProductDetailPage from './pages/admin/products/ProductDetailPage'

function App() {
  return (
    <BrowserRouter>
      <WebSocketBridge />
      <LowStockToaster />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/allocations" element={<AllocationsPage />} />
          <Route path="/allocations/new" element={<AllocationNewPage />} />
          <Route path="/allocations/:id" element={<AllocationDetailPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/new" element={<OrderNewPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/warehouse-stock" element={<WarehouseStockPage />} />
          <Route path="/store-stock/:storeId/:stockId" element={<StoreStockDetailPage />} />
          <Route path="/store-stock" element={<StoreStockPage />} />
          <Route path="/movements" element={<MovementsPage />} />
          <Route path="/admin/users" element={<UsersAdminPage />} />
          <Route path="/admin/products" element={<ProductListPage />} />
          <Route path="/admin/products/new" element={<ProductRegisterPage />} />
          <Route path="/admin/products/:id" element={<ProductDetailPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
