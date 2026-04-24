export function allocationStatusLabel(status: string): string {
  switch (status) {
    case 'REQUESTED':
      return '요청'
    case 'APPROVED':
      return '승인'
    case 'SHIPPED':
      return '출고'
    case 'RECEIVED':
      return '입고완료'
    case 'CANCELLED':
      return '취소'
    default:
      return status
  }
}
