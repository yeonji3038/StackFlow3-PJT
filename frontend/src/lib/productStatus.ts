export type ProductStatusValue = 'ON_SALE' | 'DISCONTINUED' | 'OUTLET'

export const PRODUCT_STATUS_OPTIONS: { value: ProductStatusValue; label: string }[] = [
  { value: 'ON_SALE', label: '판매중' },
  { value: 'DISCONTINUED', label: '단종' },
  { value: 'OUTLET', label: '아울렛' },
]

export function productStatusLabel(status: ProductStatusValue): string {
  return PRODUCT_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status
}
