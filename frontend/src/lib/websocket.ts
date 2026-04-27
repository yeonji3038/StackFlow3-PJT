import { useEffect, useRef } from 'react'
import SockJS from 'sockjs-client'
import { Client, type IMessage } from '@stomp/stompjs'
import { useStockStore, type LowStockAlert } from '../stores/stockStore'

const WS_URL = 'http://localhost:8080/ws'

const TOPICS = {
  allocations: '/topic/allocations',
  lowStock: '/topic/low-stock',
  dashboard: '/topic/dashboard',
} as const

function parseJsonMessage(message: IMessage): unknown {
  const body = message.body?.trim()
  if (!body) return null
  try {
    return JSON.parse(body) as unknown
  } catch {
    return null
  }
}

/** 백엔드 페이로드(camelCase / snake_case)에서 저재고 알림 항목 추출 */
function parseLowStockItems(raw: unknown): Omit<LowStockAlert, 'id'>[] {
  if (raw == null) return []
  let payload: unknown = raw
  if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>
    if (Array.isArray(o.alerts)) payload = o.alerts
    else if (Array.isArray(o.data)) payload = o.data
    else if (Array.isArray(o.items)) payload = o.items
  }
  const list = Array.isArray(payload) ? payload : [payload]
  const out: Omit<LowStockAlert, 'id'>[] = []
  for (const item of list) {
    if (!item || typeof item !== 'object') continue
    const o = item as Record<string, unknown>
    const skuCode = String(o.skuCode ?? o.sku_code ?? o.sku ?? '').trim()
    const warehouseName = String(o.warehouseName ?? o.warehouse_name ?? '').trim()
    const q = o.quantity ?? o.qty
    const quantity = typeof q === 'number' ? q : Number(q)
    if (!skuCode || !warehouseName || Number.isNaN(quantity)) continue
    out.push({ skuCode, warehouseName, quantity })
  }
  return out
}

/**
 * STOMP + SockJS 로 `/ws`에 연결하고 구독 토픽 메시지마다 스토어 콜백을 실행합니다.
 * 언마운트 시 연결을 끊습니다.
 */
export function useWebSocket(): void {
  const bumpDashboardRefresh = useStockStore((s) => s.bumpDashboardRefresh)
  const bumpAllocationRefresh = useStockStore((s) => s.bumpAllocationRefresh)
  const pushLowStockAlert = useStockStore((s) => s.pushLowStockAlert)

  const actionsRef = useRef({
    bumpDashboardRefresh,
    bumpAllocationRefresh,
    pushLowStockAlert,
  })
  actionsRef.current = {
    bumpDashboardRefresh,
    bumpAllocationRefresh,
    pushLowStockAlert,
  }

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL) as unknown as WebSocket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        const { bumpDashboardRefresh, bumpAllocationRefresh, pushLowStockAlert } =
          actionsRef.current

        client.subscribe(TOPICS.dashboard, () => {
          bumpDashboardRefresh()
        })

        client.subscribe(TOPICS.allocations, () => {
          bumpAllocationRefresh()
        })

        client.subscribe(TOPICS.lowStock, (message: IMessage) => {
          const parsed = parseJsonMessage(message)
          const items = parseLowStockItems(parsed)
          for (const item of items) {
            pushLowStockAlert(item)
          }
        })
      },
    })

    client.activate()

    return () => {
      client.deactivate()
    }
  }, [])
}
