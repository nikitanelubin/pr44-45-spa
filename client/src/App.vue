<template>
  <header class="header">
    <RouterLink to="/" class="logo">🥖 Домашний Хлеб</RouterLink>

    <!-- ссылки зависят от входа: вошедшему - экраны сайта и выход, гостю - регистрация и вход -->
    <nav v-if="auth.isAuthenticated" class="nav">
      <RouterLink to="/menu">Меню дня</RouterLink>
      <RouterLink to="/shop">Магазин</RouterLink>
      <RouterLink to="/cart">Корзина</RouterLink>
      <RouterLink to="/search">Поиск</RouterLink>
      <a href="#" @click.prevent="logout">Выход</a>
    </nav>
    <nav v-else class="nav">
      <RouterLink to="/register">Регистрация</RouterLink>
      <RouterLink to="/login">Авторизация</RouterLink>
    </nav>
  </header>

  <main class="container">
    <!-- v-slot даёт компонент текущей страницы, чтобы завернуть его в анимацию перехода -->
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>

  <!-- всплывающие сообщения из stores/toast.js; TransitionGroup анимирует появление и исчезновение -->
  <TransitionGroup name="toast" tag="div" class="toasts">
    <div v-for="item in toast.items" :key="item.id" class="toast" :class="item.type">
      {{ item.text }}
    </div>
  </TransitionGroup>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { api } from './api'
import { useAuthStore } from './stores/auth'
import { useToastStore } from './stores/toast'

const auth = useAuthStore()
const toast = useToastStore()
const router = useRouter()

// выход: API стирает токен, сайт забывает его у себя и переходит на вход
const logout = async () => {
  await api.post('/logout').catch(() => {})
  auth.clear()
  toast.show('Вы вышли из аккаунта')
  router.push('/login')
}
</script>
