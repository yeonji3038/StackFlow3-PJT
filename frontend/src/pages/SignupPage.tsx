import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { getToken } from '../lib/auth'

type Role = 'HQ_STAFF' | 'STORE_MANAGER' | 'WAREHOUSE_STAFF'

export default function SignupPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<Role>('STORE_MANAGER')
  const [storeId, setStoreId] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (getToken()) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  const canSubmit = useMemo(() => {
    if (!email.trim() || !password.trim() || !name.trim()) return false
    if (role === 'STORE_MANAGER' && !storeId.trim()) return false
    return true
  }, [email, password, name, role, storeId])

  const handleSignup = async () => {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    setError('')
    try {
      await axios.post('http://localhost:8080/api/auth/signup', {
        email,
        password,
        name,
        role,
        storeId: role === 'STORE_MANAGER' ? Number(storeId) : null,
      })
      navigate('/login', { replace: true })
    } catch {
      setError('회원가입에 실패했습니다. 입력값을 확인해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">📦</span>
          </div>
          <h1 className="text-2xl font-bold">회원가입</h1>
          <p className="text-gray-500 text-sm mt-1">StockFlow 계정을 생성합니다.</p>
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

          <div>
            <label className="block text-sm font-medium mb-1">이름</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="이름 입력"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">역할</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full border rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="HQ_STAFF">본사 (HQ_STAFF)</option>
              <option value="STORE_MANAGER">매장 관리자 (STORE_MANAGER)</option>
              <option value="WAREHOUSE_STAFF">창고 담당 (WAREHOUSE_STAFF)</option>
            </select>
          </div>

          {role === 'STORE_MANAGER' ? (
            <div>
              <label className="block text-sm font-medium mb-1">매장 ID</label>
              <input
                inputMode="numeric"
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예) 1"
              />
              <p className="mt-1 text-xs text-gray-400">매장 관리자는 매장 ID가 필요합니다.</p>
            </div>
          ) : null}

          {error ? (
            <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-lg">{error}</div>
          ) : null}

          <button
            onClick={handleSignup}
            disabled={!canSubmit || submitting}
            className="w-full bg-blue-500 disabled:bg-blue-300 hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition"
          >
            {submitting ? '처리 중…' : '회원가입'}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          이미 계정이 있나요?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
            로그인
          </Link>
        </div>
      </div>
    </div>
  )
}

