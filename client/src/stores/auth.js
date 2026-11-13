import { defineStore } from 'pinia'

// Кто вошёл: токен и имя. Общие для всех страниц, поэтому лежат в Pinia, а не в одной странице.
// Копия в localStorage нужна, чтобы вход не терялся после перезагрузки страницы
export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    name: localStorage.getItem('name') || null,
  }),

  getters: {
    // !! превращает значение в true/false: есть токен - пользователь вошёл
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    save(token, name) {
      this.token = token
      this.name = name
      localStorage.setItem('token', token)
      localStorage.setItem('name', name)
    },

    clear() {
      this.token = null
      this.name = null
      localStorage.removeItem('token')
      localStorage.removeItem('name')
    },
  },
})
