import { getRole } from '../../lib/auth'
import SectionCard from '../../components/ui/SectionCard'
import ProductRegisterForm from '../../components/product/ProductRegisterForm'

export default function ProductRegisterPage() {
  const role = getRole()

  if (role !== 'HQ_STAFF') {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-semibold text-slate-900">상품 등록</h1>
        <p className="text-sm text-slate-500">본사(HQ) 권한에서만 접근할 수 있습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">상품 등록</h1>
      </div>

      <SectionCard title="신규 상품">
        <ProductRegisterForm />
      </SectionCard>
    </div>
  )
}
