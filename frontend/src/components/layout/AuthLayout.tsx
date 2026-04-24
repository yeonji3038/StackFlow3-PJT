import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getToken, trySilentRefresh } from '../../lib/auth'
import LoadingSpinner from '../ui/LoadingSpinner'
import AppShell from './AppShell'

export default function AuthLayout() {
  const [ready, setReady] = useState(false)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (getToken()) {
        if (!cancelled) {
          setAllowed(true)
          setReady(true)
        }
        return
      }
      const ok = await trySilentRefresh()
      if (!cancelled) {
        setAllowed(ok)
        setReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (!ready) {
    return <LoadingSpinner />
  }
  if (!allowed) {
    return <Navigate to="/login" replace />
  }
  return <AppShell />
}
