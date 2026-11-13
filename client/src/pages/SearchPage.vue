<template>
  <div>
    <h1>Поиск</h1>
    <form class="search-form" novalidate @submit.prevent="search">
      <div class="field grow">
        <input v-model="query" placeholder="Название блюда" :class="{ invalid: error }" />
        <span v-if="error" class="error-text">{{ error }}</span>
      </div>
      <button class="btn">Найти</button>
    </form>

    <TransitionGroup name="list" tag="div" class="grid">
      <div v-for="dish in results" :key="dish.id" class="card dish-card">
        <img :src="imageUrl(dish.image)" :alt="dish.name" />
        <strong>{{ dish.name }}</strong>
      </div>
    </TransitionGroup>

    <p v-if="searched && results.length === 0" class="empty">Ничего не найдено.</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { api, imageUrl } from '../api'
import { useToastStore } from '../stores/toast'

const toast = useToastStore()
const query = ref('')
const results = ref([])
const error = ref('')
// searched - был ли уже поиск: «Ничего не найдено» показываем только после него, а не сразу при открытии
const searched = ref(false)

// поиск выполняет API (LIKE по названию), страница только выводит названия и фото найденных блюд
const search = async () => {
  error.value = ''
  try {
    const { data } = await api.get('/search', { params: { q: query.value } })
    results.value = data
    searched.value = true
  } catch (err) {
    if (err.response && err.response.status === 422) {
      error.value = err.response.data.errors.q
    } else {
      toast.show('Не удалось выполнить поиск', 'error')
    }
  }
}
</script>
