<script setup lang="ts">
import type { Message } from '@/types'

const props = defineProps<{
  message: Message
}>()

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
</script>

<template>
  <div class="message" :class="message.role">
    <div class="message-avatar">
      <span v-if="message.role === 'agent'">
        <!-- Bot icon -->
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"
          stroke-linecap="round" stroke-linejoin="round">
          <rect x="4" y="6" width="12" height="10" rx="3" />
          <path d="M8 6V4h4v2" />
          <circle cx="8" cy="11" r="1" fill="currentColor" stroke="none" />
          <circle cx="12" cy="11" r="1" fill="currentColor" stroke="none" />
          <path d="M8 14h4" />
        </svg>
      </span>
      <span v-else>
        <!-- User icon -->
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"
          stroke-linecap="round" stroke-linejoin="round">
          <circle cx="10" cy="7" r="3" />
          <path d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6" />
        </svg>
      </span>
    </div>

    <div class="message-body">
      <div class="message-bubble">
        <p class="message-text">{{ message.content }}</p>
        <span v-if="message.isStreaming" class="cursor-blink">▋</span>
      </div>
      <time class="message-time">{{ formatTime(message.timestamp) }}</time>
    </div>
  </div>
</template>

<style scoped>
.message {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 4px 0;
  animation: fadeSlideIn 0.2s ease;
}

.message.user {
  flex-direction: row-reverse;
}

/* Avatar */
.message-avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: #fff;
}

.message.assistant .message-avatar {
  background: var(--teal);
}

.message.user .message-avatar {
  background: var(--amber);
}

.message-avatar svg {
  width: 16px;
  height: 16px;
}

/* Body */
.message-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 70%;
}

.message.user .message-body {
  align-items: flex-end;
}

/* Bubble */
.message-bubble {
  padding: 11px 15px;
  border-radius: 14px;
  line-height: 1.55;
  font-size: 0.9rem;
  word-break: break-word;
}

.message.assistant .message-bubble {
  background: #fff;
  border: 1px solid var(--border);
  color: var(--ink);
  border-top-left-radius: 4px;
}

.message.user .message-bubble {
  background: var(--amber);
  color: #fff;
  border-top-right-radius: 4px;
}

.message-text {
  margin: 0;
  white-space: pre-wrap;
}

/* Streaming cursor */
.cursor-blink {
  display: inline-block;
  animation: blink 1s step-start infinite;
  opacity: 1;
  color: var(--teal);
  font-weight: bold;
  margin-left: 2px;
}

/* Time */
.message-time {
  font-size: 0.72rem;
  color: var(--muted);
  padding: 0 2px;
}

/* Animations */
@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes blink {
  50% { opacity: 0; }
}
</style>