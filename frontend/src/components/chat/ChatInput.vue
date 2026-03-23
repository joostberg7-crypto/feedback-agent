<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits<{
  send: [content: string]
}>()

const props = defineProps<{
  disabled?: boolean
  placeholder?: string
}>()

const input = ref('')

const canSend = computed(() => input.value.trim().length > 0 && !props.disabled)

function handleSend() {
  if (!canSend.value) return
  emit('send', input.value.trim())
  input.value = ''
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function autoResize(e: Event) {
  const el = e.target as HTMLTextAreaElement
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 160) + 'px'
}
</script>

<template>
  <div class="chat-input-wrap">
    <div class="chat-input-box" :class="{ disabled }">
      <textarea
        v-model="input"
        class="chat-textarea"
        :placeholder="placeholder ?? 'Stuur een bericht...'"
        :disabled="disabled"
        rows="1"
        @keydown="handleKeydown"
        @input="autoResize"
      />
      <button
        class="send-btn"
        :disabled="!canSend"
        @click="handleSend"
        aria-label="Verstuur bericht"
      >
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 10l14-7-5 7 5 7-14-7z" />
        </svg>
      </button>
    </div>
    <p class="input-hint">
      <kbd>Enter</kbd> om te versturen &nbsp;·&nbsp; <kbd>Shift+Enter</kbd> voor nieuwe regel
    </p>
  </div>
</template>

<style scoped>
.chat-input-wrap {
  padding: 12px 20px 16px;
  background: var(--paper);
  border-top: 1px solid var(--border);
}

.chat-input-box {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  background: #fff;
  border: 1.5px solid var(--border);
  border-radius: 14px;
  padding: 10px 12px;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.chat-input-box:focus-within {
  border-color: var(--amber);
  box-shadow: 0 0 0 3px rgba(212, 130, 10, 0.1);
}

.chat-input-box.disabled {
  opacity: 0.55;
  pointer-events: none;
}

.chat-textarea {
  flex: 1;
  resize: none;
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-size: 0.9rem;
  color: var(--ink);
  line-height: 1.5;
  min-height: 24px;
  max-height: 160px;
  overflow-y: auto;
}

.chat-textarea::placeholder {
  color: var(--muted);
}

.send-btn {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--amber);
  border: none;
  cursor: pointer;
  display: grid;
  place-items: center;
  color: #fff;
  transition: background 0.15s, transform 0.1s;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  background: var(--amber-light);
  transform: scale(1.05);
}

.send-btn:disabled {
  background: var(--border);
  color: var(--muted);
  cursor: not-allowed;
  transform: none;
}

.send-btn svg {
  width: 15px;
  height: 15px;
}

.input-hint {
  font-size: 0.7rem;
  color: var(--muted);
  margin-top: 6px;
  text-align: center;
}

.input-hint kbd {
  font-family: inherit;
  background: var(--cream);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 0.68rem;
}
</style>