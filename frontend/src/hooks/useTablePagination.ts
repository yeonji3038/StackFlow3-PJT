import { useEffect, useMemo, useState } from 'react'
import { TABLE_PAGE_SIZE, getPageCount, slicePage } from '../lib/tablePagination'

export function useTablePagination<T>(items: T[]) {
  const [page, setPage] = useState(1)
  const total = items.length
  const pageCount = getPageCount(total)

  useEffect(() => {
    setPage(1)
  }, [items])

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), pageCount))
  }, [pageCount])

  const pageItems = useMemo(() => slicePage(items, page), [items, page])

  const fromIdx = total === 0 ? 0 : (page - 1) * TABLE_PAGE_SIZE + 1
  const toIdx = Math.min(page * TABLE_PAGE_SIZE, total)

  return { page, setPage, pageItems, pageCount, total, pageSize: TABLE_PAGE_SIZE, fromIdx, toIdx }
}
