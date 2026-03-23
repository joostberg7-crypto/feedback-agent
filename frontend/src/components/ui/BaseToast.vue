<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = withDefaults(defineProps<{
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
}>(), {
  type: 'info',
  duration: 3500,
})

const emit = defineEmits<{ close: [] }>()
const visible = ref(false)

onMounted(() => {
  visible.value = true
  setTimeout(() => {
    visible.value = false
    setTimeout(() => emit('close'), 300)
  }, props.duration)
})
</script>

<template>
  <Transition name="toast">
    <div v-if="visible" class="toast" :class="`type-${type}`">
      <span class="toast-icon">
        <template v-if="type === 'success'">✓</template>
        <template v-else-if="type === 'error'">✕</template>
        <template v-else>ℹ</template>
      </span>
      {{ message }}
    </div>
  </Transition>
</template>

<style scoped>
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 500;
  box-shadow: 0 8px 32px rgba(15, 14, 13, 0.15);
  z-index: 100;
  border: 1.5px solid transparent;
}

.type-success { background: var(--teal-light); color: var(--teal); border-color: #b2d8d8; }
.type-error   { background: #fdecea; color: #c0392b; border-color: #f5c0bb; }
.type-info    { background: var(--amber-pale); color: var(--amber); border-color: #f0d99a; }

.toast-icon {
  font-size: 0.75rem;
  font-weight: 700;
  font-family: 'DM Mono', monospace;
}

.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(8px); }
</style>
