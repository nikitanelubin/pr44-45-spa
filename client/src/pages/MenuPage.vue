<template>
  <div>
    <div class="page-head">
      <h1>Меню дня</h1>
      <RouterLink to="/shop" class="btn">Магазин</RouterLink>
    </div>

    <h2>Акции</h2>
    <div class="grid promos">
      <div v-for="promo in menu.promotions" :key="promo.id" class="card promo">
        <strong>{{ promo.title }}</strong>
        <p>{{ promo.text }}</p>
      </div>
    </div>

    <h2>Рекомендуем</h2>
    <div class="grid">
      <div v-for="dish in menu.recommended" :key="dish.id" class="card dish-card">
        <img :src="imageUrl(dish.image)" :alt="dish.name" />
        <strong>{{ dish.name }}</strong>
        <span class="price">{{ dish.price }} ₽</span>
      </div>
    </div>

    <h2>Новинки</h2>
    <div class="grid">
      <div v-for="dish in menu.novelties" :key="dish.id" class="card dish-card">
        <img :src="imageUrl(dish.image)" :alt="dish.name" />
        <strong>{{ dish.name }}</strong>
        <span class="price">{{ dish.price }} ₽</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api, imageUrl } from '../api'
import { useToastStore } from '../stores/toast'

const toast = useToastStore()
// пока ответа нет, три пустых списка: страница уже рисуется, а блоки заполнятся после ответа API
const menu = ref({ promotions: [], recommended: [], novelties: [] })

// при открытии страницы одним запросом получаем все три блока: акции, рекомендации, новинки
onMounted(async () => {
  try {
    const { data } = await api.get('/menu')
    menu.value = data
  } catch {
    toast.show('Не удалось загрузить меню', 'error')
  }
})
</script>
