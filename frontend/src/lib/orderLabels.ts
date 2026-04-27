export function orderStatusLabel(status: string): string {
  switch (status) {
    case 'REQUESTED':
      return '요청'
    case 'APPROVED':
      return '승인'
    case 'REJECTED':
      return '반려'
    case 'SHIPPED':
      return '출고'
    case 'RECEIVED':
      return '입고완료'
    case 'CANCELLED':
      return '취소'
    case 'COMPLETED':
      return '완료'
    default:
      return status
  }
}

/** 상태 코드·API statusDescription(코드 문자열) 모두 한글로 통일해 표시합니다. */
export function orderStatusDisplayText(order: {
  status: string
  statusDescription?: string | null
}): string {
  const d = order.statusDescription?.trim()
  if (d) {
    const codeKey = d.toUpperCase().replace(/[\s-]+/g, '_')
    const fromDesc = orderStatusLabel(codeKey)
    if (fromDesc !== codeKey) return fromDesc
    return d
  }
  return orderStatusLabel(order.status)
}

