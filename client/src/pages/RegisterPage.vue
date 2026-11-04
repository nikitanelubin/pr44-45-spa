<template>
  <div class="card form-card">
    <h1>Регистрация</h1>
    <form novalidate @submit.prevent="submit">
      <div class="field">
        <label>Имя</label>
        <input v-model="form.name" :class="{ invalid: errors.name }" />
        <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
      </div>
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
      <button class="btn btn-wide" :disabled="loading">Зарегистрироваться</button>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api'
import { useToastStore } from '../stores/toast'

const router = useRouter()
const toast = useToastStore()

const form = reactive({ name: '', email: '', password: '' })
const errors = ref({})
const loading = ref(false)

const submit = async () => {
  errors.value = {}
  loading.value = true
  try {
    await api.post('/register', form)
    toast.show('Регистрация прошла успешно. Теперь войдите в систему')
    router.push('/login')
  } catch (err) {
    if (err.response && err.response.status === 422) {
      errors.value = err.response.data.errors
    } else {
      toast.show('Не удалось зарегистрироваться', 'error')
    }
  } finally {
    loading.value = false
  }
}
</script>
