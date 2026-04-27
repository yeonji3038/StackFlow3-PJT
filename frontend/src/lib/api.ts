import axios from 'axios'
import { API_BASE_URL } from './apiBase'
import { refreshAccessTokenSingleFlight } from './auth'

export const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as typeof error.config & { _retry?: boolean }
    if (!original || original._retry) {
      return Promise.reject(error)
    }
    if (error.response?.status !== 401) {
      return Promise.reject(error)
    }
    const url = String(original.url ?? '')
    if (url.includes('/api/auth/refresh') || url.includes('/api/auth/login')) {
      return Promise.reject(error)
    }
    const ok = await refreshAccessTokenSingleFlight()
    if (!ok) {
      return Promise.reject(error)
    }
    original._retry = true
    const token = localStorage.getItem('token')
    if (token) {
      original.headers.Authorization = `Bearer ${token}`
    }
    return api(original)
  },
)
