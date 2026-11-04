import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    name: localStorage.getItem('name') || null,
  }),

  getters: {
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
