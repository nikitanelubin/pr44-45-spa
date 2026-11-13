import { defineStore } from 'pinia'

let nextId = 1

// Всплывающие сообщения: любая страница вызывает toast.show('текст'), а выводит их App.vue в углу экрана.
// Через 3 секунды сообщение убирается из списка и исчезает с анимацией
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
