import { useWebSocket } from '../../lib/websocket'

/** 앱 트리 안에서 STOMP 연결을 한 번 활성화합니다. */
export default function WebSocketBridge() {
  useWebSocket()
  return null
}
