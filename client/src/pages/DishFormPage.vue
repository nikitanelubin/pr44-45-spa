<template>
  <div class="card form-card wide">
    <h1>{{ isEdit ? 'Редактирование блюда' : 'Создание блюда' }}</h1>
    <form novalidate @submit.prevent="save">
      <div class="field">
        <label>Название</label>
        <input v-model="form.name" :class="{ invalid: errors.name }" />
        <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
      </div>
      <div class="field">
        <label>Состав</label>
        <textarea v-model="form.composition" rows="2" :class="{ invalid: errors.composition }"></textarea>
        <span v-if="errors.composition" class="error-text">{{ errors.composition }}</span>
      </div>

      <div class="form-row">
        <div v-for="item in numberFields" :key="item.key" class="field">
          <label>{{ item.label }}</label>
          <input v-model="form[item.key]" type="number" min="0" step="any" :class="{ invalid: errors[item.key] }" />
          <span v-if="errors[item.key]" class="error-text">{{ errors[item.key] }}</span>
        </div>
      </div>

      <div class="field">
        <label>Способ приготовления</label>
        <input v-model="form.cook_method" :class="{ invalid: errors.cook_method }" />
        <span v-if="errors.cook_method" class="error-text">{{ errors.cook_method }}</span>
      </div>

      <!-- Область для перетаскивания файла. .prevent на dragover обязателен, иначе браузер не разрешит drop -->
      <div class="field">
        <label>Изображение</label>
        <div
          class="drop-zone"
          :class="{ over: isOver, invalid: errors.image }"
          @dragover.prevent="isOver = true"
          @dragleave="isOver = false"
          @drop.prevent="onDrop"
          @click="fileInput.click()"
        >
          <img v-if="preview" :src="preview" alt="Предпросмотр" />
          <span v-else>Перетащите изображение сюда или нажмите для выбора</span>
        </div>
        <input ref="fileInput" type="file" accept="image/jpeg,image/png" hidden @change="onSelect" />
        <span v-if="errors.image" class="error-text">{{ errors.image }}</span>
      </div>

      <div class="head-buttons">
        <button class="btn" :disabled="loading">Сохранить</button>
        <RouterLink to="/shop" class="btn btn-light">К списку блюд</RouterLink>
      </div>
    </form>

    <AppModal
      :show="showSaved"
      title="Блюдо добавлено"
      :text="`Блюдо «${form.name}» успешно добавлено в магазин.`"
      @confirm="toShop"
      @cancel="toShop"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api, imageUrl } from '../api'
import AppModal from '../components/AppModal.vue'
import { useToastStore } from '../stores/toast'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()

const isEdit = computed(() => !!route.params.id)

const numberFields = [
  { key: 'calories', label: 'Калории' },
  { key: 'proteins', label: 'Белки, г' },
  { key: 'fats', label: 'Жиры, г' },
  { key: 'carbs', label: 'Углеводы, г' },
  { key: 'price', label: 'Цена, ₽' },
  { key: 'cook_time', label: 'Время, мин' },
]

const form = reactive({
  name: '',
  composition: '',
  calories: '',
  proteins: '',
  fats: '',
  carbs: '',
  price: '',
  cook_time: '',
  cook_method: '',
})
const errors = ref({})
const loading = ref(false)
const showSaved = ref(false)

const fileInput = ref(null)
const file = ref(null)
const preview = ref('')
const isOver = ref(false)

const setFile = (selected) => {
  if (!selected) return
  file.value = selected
  // createObjectURL даёт временный адрес файла, чтобы показать картинку до загрузки на сервер
  preview.value = URL.createObjectURL(selected)
}

const onDrop = (event) => {
  isOver.value = false
  setFile(event.dataTransfer.files[0])
}

const onSelect = (event) => setFile(event.target.files[0])

const toShop = () => router.push('/shop')

const save = async () => {
  errors.value = {}
  loading.value = true
  // FormData нужна, чтобы отправить файл вместе с текстовыми полями
  const body = new FormData()
  Object.entries(form).forEach(([key, value]) => body.append(key, value))
  if (file.value) body.append('image', file.value)

  try {
    if (isEdit.value) {
      await api.put(`/dishes/${route.params.id}`, body)
      toast.show('Изменения сохранены')
      toShop()
    } else {
      await api.post('/dishes', body)
      showSaved.value = true
    }
  } catch (err) {
    if (err.response && err.response.status === 422) {
      errors.value = err.response.data.errors
      toast.show('Проверьте заполнение полей', 'error')
    } else {
      toast.show('Не удалось сохранить блюдо', 'error')
    }
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (!isEdit.value) return
  try {
    const { data } = await api.get(`/dishes/${route.params.id}`)
    Object.keys(form).forEach((key) => {
      form[key] = data[key]
    })
    preview.value = imageUrl(data.image)
  } catch {
    toast.show('Блюдо не найдено', 'error')
    toShop()
  }
})
</script>
