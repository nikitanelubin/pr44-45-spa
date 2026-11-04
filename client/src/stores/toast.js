import { defineStore } from 'pinia'

let nextId = 1

// Всплывающие сообщения: появляются в углу экрана и исчезают сами
export const useToastStore = defineStore('toast', {
  state: () => ({ items: [] }),

  actions: {
    show(text, type = 'success') {
      const id = nextId++
      this.items.push({ id, text, type })
      setTimeout(() => {
        this.items = this.items.filter((item) => item.id !== id)
      }, 3000)
    },
  },
})
