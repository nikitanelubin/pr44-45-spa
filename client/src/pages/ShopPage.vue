<template>
  <div>
    <div class="page-head">
      <h1>Магазин</h1>
      <div class="head-buttons">
        <RouterLink to="/menu" class="btn btn-light">Меню дня</RouterLink>
        <RouterLink to="/shop/new" class="btn">Добавить блюдо</RouterLink>
      </div>
    </div>

    <div v-for="dish in dishes" :key="dish.id" class="card accordion">
      <div class="accordion-head">
        <strong>{{ dish.name }}</strong>
        <div class="accordion-actions">
          <RouterLink :to="`/shop/${dish.id}/edit`" class="icon-btn" title="Редактировать">✏️</RouterLink>
          <button class="icon-btn" title="Удалить" @click="removeDish(dish)">🗑️</button>
          <button class="icon-btn arrow" :class="{ open: openId === dish.id }" title="Подробнее" @click="toggle(dish.id)">▼</button>
        </div>
      </div>

      <Transition name="accordion">
        <div v-if="openId === dish.id" class="accordion-body">
          <img :src="imageUrl(dish.image)" :alt="dish.name" />
          <div class="accordion-info">
            <p><b>Состав:</b> {{ dish.composition }}</p>
            <p>
              <b>КБЖУ на 100 г:</b> {{ dish.calories }} ккал, белки {{ dish.proteins }} г,
              жиры {{ dish.fats }} г, углеводы {{ dish.carbs }} г
            </p>
            <p><b>Цена:</b> {{ dish.price }} ₽</p>
            <div class="tech">
              <p><b>Время готовки:</b> {{ dish.cook_time }} мин</p>
              <p><b>Способ приготовления:</b> {{ dish.cook_method }}</p>
            </div>
            <button class="btn" @click="addToCart(dish)">В корзину</button>
          </div>
        </div>
      </Transition>
    </div>

    <AppModal
      :show="showSoldOut"
      title="Блюдо закончилось"
      text="Больше двух порций одного блюда заказать нельзя."
      @confirm="showSoldOut = false"
      @cancel="showSoldOut = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api, imageUrl } from '../api'
import AppModal from '../components/AppModal.vue'
import { useToastStore } from '../stores/toast'

const toast = useToastStore()
const dishes = ref([])
const openId = ref(null)
const showSoldOut = ref(false)

const load = async () => {
  try {
    const { data } = await api.get('/dishes')
    dishes.value = data
  } catch {
    toast.show('Не удалось загрузить блюда', 'error')
  }
}

const toggle = (id) => {
  openId.value = openId.value === id ? null : id
}

const addToCart = async (dish) => {
  try {
    await api.post('/cart', { dish_id: dish.id })
    toast.show(`${dish.name}: добавлено в корзину`)
  } catch (err) {
    if (err.response && err.response.data.code === 'out_of_stock') {
      showSoldOut.value = true
    } else {
      toast.show('Не удалось добавить в корзину', 'error')
    }
  }
}

const removeDish = async (dish) => {
  try {
    await api.delete(`/dishes/${dish.id}`)
    toast.show(`${dish.name}: блюдо удалено`)
    await load()
  } catch {
    toast.show('Не удалось удалить блюдо', 'error')
  }
}

onMounted(load)
</script>
