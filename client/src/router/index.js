import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import RegisterPage from '../pages/RegisterPage.vue'
import LoginPage from '../pages/LoginPage.vue'
import MenuPage from '../pages/MenuPage.vue'
import ShopPage from '../pages/ShopPage.vue'
import DishFormPage from '../pages/DishFormPage.vue'
import CartPage from '../pages/CartPage.vue'
import SearchPage from '../pages/SearchPage.vue'

const routes = [
  { path: '/', redirect: '/menu' },
  { path: '/register', component: RegisterPage, meta: { guestOnly: true } },
  { path: '/login', component: LoginPage, meta: { guestOnly: true } },
  { path: '/menu', component: MenuPage, meta: { requiresAuth: true } },
  { path: '/shop', component: ShopPage, meta: { requiresAuth: true } },
  { path: '/shop/new', component: DishFormPage, meta: { requiresAuth: true } },
  { path: '/shop/:id/edit', component: DishFormPage, meta: { requiresAuth: true } },
  { path: '/cart', component: CartPage, meta: { requiresAuth: true } },
  { path: '/search', component: SearchPage, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) return '/login'
  if (to.meta.guestOnly && auth.isAuthenticated) return '/menu'
})

export default router
