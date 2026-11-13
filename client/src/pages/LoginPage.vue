<template>
  <div class="card form-card">
    <h1>Вход в систему</h1>
    <form novalidate @submit.prevent="submit">
      <div class="field">
        <label>Email</label>
        <input v-model="form.email" type="email" :class="{ invalid: errors.email }" />
        <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
      </div>
      <div class="field">
        <label>Пароль</label>
        <input v-model="form.password" type="password" :class="{ invalid: errors.password }" />
        <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
      </div>
      <p v-if="message" class="error-box">{{ message }}</p>
      <button class="btn btn-wide">Войти</button>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'

const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()

const form = reactive({ email: '', password: '' })
const errors = ref({})
const message = ref('')

// Три исхода входа:
// успех - сохраняем токен в auth (дальше его добавит api.js) и идём в «Меню дня»;
// 422 - пустые поля, ошибки под полями; 401 - неверный email или пароль, общее сообщение
const submit = async () => {
  errors.value = {}
  message.value = ''
  try {
    const { data } = await api.post('/login', form)
    auth.save(data.token, data.user.name)
    toast.show(`Добро пожаловать, ${data.user.name}!`)
    router.push('/menu')
  } catch (err) {
    if (err.response && err.response.status === 422) {
      errors.value = err.response.data.errors
    } else if (err.response && err.response.status === 401) {
      message.value = err.response.data.message
    } else {
      message.value = 'Нет связи с сервером'
    }
  }
}
</script>
