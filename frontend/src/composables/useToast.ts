import { ref } from 'vue'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

const toasts = ref<Toast[]>([])
let counter = 0

export function useToast() {
  function show(message: string, type: Toast['type'] = 'info') {
    const id = counter++
    toasts.value.push({ id, message, type })
  }

  function remove(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  const success = (msg: string) => show(msg, 'success')
  const error   = (msg: string) => show(msg, 'error')
  const info    = (msg: string) => show(msg, 'info')

  return { toasts, show, remove, success, error, info }
}
