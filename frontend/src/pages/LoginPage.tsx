import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { getToken, setRefreshToken, trySilentRefresh } from '../lib/auth'
import { API_BASE_URL } from '../lib/apiBase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (getToken()) {
        navigate('/dashboard', { replace: true })
        return
      }
      const ok = await trySilentRefresh()
      if (!cancelled && ok) {
        navigate('/dashboard', { replace: true })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [navigate])

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      })
      localStorage.setItem('token', response.data.accessToken)
      if (rememberMe && response.data.refreshToken) {
        setRefreshToken(response.data.refreshToken)
      } else {
        setRefreshToken(null)
      }
      localStorage.setItem('role', response.data.role)
      localStorage.setItem('name', response.data.name)
      if (response.data.email) {
        localStorage.setItem('userEmail', String(response.data.email))
      } else {
        localStorage.removeItem('userEmail')
      }
      if (response.data.userId != null) {
        localStorage.setItem('userId', String(response.data.userId))
      } else {
        localStorage.removeItem('userId')
      }
      if (response.data.storeId != null) {
        localStorage.setItem('storeId', String(response.data.storeId))
      } else {
        localStorage.removeItem('storeId')
      }
      if (response.data.warehouseId != null) {
        localStorage.setItem('warehouseId', String(response.data.warehouseId))
      } else {
        localStorage.removeItem('warehouseId')
      }
      navigate('/dashboard')
    } catch (err) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">📦</span>
          </div>
          <h1 className="text-2xl font-bold">StockFlow</h1>
          <p className="text-gray-500 text-sm mt-1">패션 브랜드 재고관리 시스템</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="이메일 입력"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="비밀번호 입력"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            자동로그인
          </label>

          {error && (
            <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition"
          >
            로그인
          </button>

          <Link
            to="/signup"
            className="block w-full text-center border border-gray-200 hover:border-gray-300 text-gray-700 font-medium py-3 rounded-lg transition"
          >
            회원가입
          </Link>
        </div>

        <p className="text-center text-gray-400 text-xs mt-8">
          © 2026 StockFlow. All rights reserved.
        </p>
      </div>
    </div>
  )
}