import type { ProductStatusValue } from '../../lib/productStatus'

/** `GET /api/products`, `GET /api/products/:id` 응답 형태 */
export type ProductListItem = {
  id: number
  name: string
  brandId: number
  brandName: string
  categoryId: number
  categoryName: string
  seasonId: number
  seasonName: string
  price: number
  cost: number
  description: string | null
  status: ProductStatusValue
  createdAt: string
}
