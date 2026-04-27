export const TABLE_PAGE_SIZE = 15

export function getPageCount(total: number): number {
  return Math.max(1, Math.ceil(total / TABLE_PAGE_SIZE))
}

export function slicePage<T>(items: T[], page: number): T[] {
  const start = (page - 1) * TABLE_PAGE_SIZE
  return items.slice(start, start + TABLE_PAGE_SIZE)
}
