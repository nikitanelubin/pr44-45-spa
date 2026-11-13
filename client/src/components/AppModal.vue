<!-- Одно модальное окно для всех случаев: страница передаёт текст через props
     и узнаёт о нажатой кнопке через события confirm и cancel -->
<template>
  <!-- @click.self - щелчок по затемнённому фону (не по самому окну) закрывает окно -->
  <Transition name="modal">
    <div v-if="show" class="modal-back" @click.self="$emit('cancel')">
      <div class="modal-box">
        <h3>{{ title }}</h3>
        <p>{{ text }}</p>
        <div class="modal-buttons">
          <button v-if="cancelText" class="btn btn-light" @click="$emit('cancel')">{{ cancelText }}</button>
          <button class="btn" @click="$emit('confirm')">{{ confirmText }}</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  show: Boolean,
  title: String,
  text: String,
  confirmText: { type: String, default: 'ОК' },
  cancelText: String,
})

defineEmits(['confirm', 'cancel'])
</script>
