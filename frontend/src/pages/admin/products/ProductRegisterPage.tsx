import { useNavigate } from 'react-router-dom'
import { getRole } from '../../../lib/auth'
import SectionCard from '../../../components/ui/SectionCard'
import ProductRegisterForm from '../../../components/product/register/ProductRegisterForm'

export default function ProductRegisterPage() {
  const role = getRole()
  const navigate = useNavigate()
  const isHq = role === 'HQ_STAFF'

  if (!isHq) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-semibold text-slate-900">상품 등록</h1>
        <p className="text-sm text-slate-500">본사(HQ) 권한에서만 접근할 수 있습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-900">상품 등록</h1>
      <SectionCard title="신규 상품">
        <ProductRegisterForm onRegistered={() => navigate('/admin/products', { replace: true })} />
      </SectionCard>
    </div>
  )
}
