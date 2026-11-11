import axios from 'axios'
import router from './router'
import { useAuthStore } from './stores/auth'

export const API_ORIGIN = 'http://localhost:3004'

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
