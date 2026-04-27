import { useLocation } from 'react-router-dom'
import { getRole } from '../../../lib/auth'
import ProductListPanel from '../../../components/product/list/ProductListPanel'

export default function ProductListPage() {
  const { key } = useLocation()
  const isHq = getRole() === 'HQ_STAFF'

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-900">상품 목록</h1>
      <ProductListPanel canMutate={isHq} refreshKey={key} />
    </div>
  )
}
