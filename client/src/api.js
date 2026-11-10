import axios from 'axios'
import router from './router'
import { useAuthStore } from './stores/auth'

// Клиент и API открываются с одного адреса (домен Open Server), поэтому хватает пути /api.
// При npm run dev такие запросы передаёт серверу Vite (см. vite.config.js)
export const API_ORIGIN = ''

export const api = axios.create({ baseURL: `${API_ORIGIN}/api` })

// Перехватчик запросов: к каждому запросу автоматически добавляем токен
api.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

// Перехватчик ответов: если токен больше не действует, выходим на страницу входа
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLogin = error.config && error.config.url === '/login'
    if (error.response && error.response.status === 401 && !isLogin) {
      useAuthStore().clear()
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export const imageUrl = (path) => API_ORIGIN + path
