<template>
  <div>
    <div class="page-head">
      <h1>Корзина</h1>
      <button class="btn" @click="askOrder">Заказать</button>
    </div>

    <TransitionGroup name="list" tag="div">
      <div v-for="item in cart.items" :key="item.id" class="card cart-row">
        <img :src="imageUrl(item.image)" :alt="item.name" />
        <strong class="cart-name">{{ item.name }}</strong>
        <span class="price">{{ item.price }} ₽</span>
        <div class="qty">
          <button class="icon-btn" title="Уменьшить" @click="decrease(item)">−</button>
          <span>{{ item.quantity }}</span>
          <button class="icon-btn" title="Увеличить" @click="increase(item)">+</button>
        </div>
        <button class="icon-btn" title="Удалить блюдо" @click="dishToRemove = item">🗑️</button>
      </div>
    </TransitionGroup>

    <p v-if="cart.items.length === 0" class="empty">В корзине пока ничего нет.</p>
    <p v-else class="total">Итого: {{ cart.total }} ₽</p>

    <AppModal
      :show="showSoldOut"
      title="Блюдо закончилось"
      text="Больше двух порций одного блюда заказать нельзя."
      @confirm="showSoldOut = false"
      @cancel="showSoldOut = false"
    />
    <AppModal
      :show="!!dishToRemove"
      title="Удалить блюдо?"
      :text="dishToRemove ? `Блюдо «${dishToRemove.name}» будет удалено из корзины.` : ''"
      confirm-text="Удалить"
      cancel-text="Отмена"
      @confirm="removeItem"
      @cancel="dishToRemove = null"
    />
    <AppModal
      :show="showOrder"
      title="Подтверждение заказа"
      :text="`Оформить заказ на сумму ${cart.total} ₽?`"
      confirm-text="Заказать"
      cancel-text="Отмена"
      @confirm="makeOrder"
      @cancel="showOrder = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api, imageUrl } from '../api'
import AppModal from '../components/AppModal.vue'
import { useToastStore } from '../stores/toast'

const toast = useToastStore()
const cart = ref({ items: [], total: 0 })
const showSoldOut = ref(false)
const showOrder = ref(false)
const dishToRemove = ref(null)

const load = async () => {
  try {
    const { data } = await api.get('/cart')
    cart.value = data
  } catch {
    toast.show('Не удалось загрузить корзину', 'error')
  }
}

const setQuantity = async (item, quantity) => {
  try {
    const { data } = await api.patch(`/cart/${item.id}`, { quantity })
    cart.value = data
  } catch (err) {
    if (err.response && err.response.data.code === 'out_of_stock') {
      showSoldOut.value = true
    } else {
      toast.show('Не удалось изменить количество', 'error')
    }
  }
}

const increase = (item) => setQuantity(item, item.quantity + 1)

// При уменьшении с 1 до 0 спрашиваем подтверждение удаления
const decrease = (item) => {
  if (item.quantity === 1) {
    dishToRemove.value = item
  } else {
    setQuantity(item, item.quantity - 1)
  }
}

const removeItem = async () => {
  const item = dishToRemove.value
  dishToRemove.value = null
  try {
    const { data } = await api.delete(`/cart/${item.id}`)
    cart.value = data
    toast.show(`${item.name}: удалено из корзины`)
  } catch {
    toast.show('Не удалось удалить блюдо', 'error')
  }
}

// Пустую корзину заказать нельзя, об этом сообщает сервер
const askOrder = async () => {
  if (cart.value.items.length > 0) {
    showOrder.value = true
    return
  }
  try {
    await api.post('/orders')
  } catch (err) {
    toast.show(err.response ? err.response.data.message : 'Нет связи с сервером', 'error')
  }
}

const makeOrder = async () => {
  showOrder.value = false
  try {
    const { data } = await api.post('/orders')
    toast.show(`Заказ №${data.order_id} оформлен на сумму ${data.total} ₽`)
    await load()
  } catch (err) {
    toast.show(err.response ? err.response.data.message : 'Нет связи с сервером', 'error')
  }
}

onMounted(load)
</script>
