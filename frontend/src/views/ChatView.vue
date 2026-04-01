<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { useSessionsStore } from '@/stores/sessions'
import ChatMessage from '@/components/chat/ChatMessage.vue'
import ChatInput from '@/components/chat/ChatInput.vue'
import type { Message } from '@/types'
import { chatService } from '@/api/chat.service'

const store = useSessionsStore()
const isLoading = ref(false)
const scrollContainer = ref<HTMLElement | null>(null)

function getActiveMessages(): Message[] {
  const session = store.getActiveSession()
  return session ? session.messages : []
}

async function scrollToBottom() {
  await nextTick()
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
  }
}

watch(() => getActiveMessages().length, scrollToBottom)

async function handleSend(content: string) {
  const session = store.getActiveSession()
  if (!session) return

  // 1. Voeg direct toe aan UI voor snelheid
  session.messages.push({
    id: Math.random().toString(),
    role: 'user',
    content,
    timestamp: new Date()
  })

  // 2. Laat de service het werk doen
  try {
    const response = await chatService.sendMessage(session.id, content)
    // Voeg AI antwoord toe aan de lijst
    session.messages.push({
      id: response.id,
      role: 'user',
      content: response.content,
      timestamp: new Date(response.createdAt)
    })
  } catch (error) {
    console.error("Chat fout:", error)
  }
}
</script>

<template>
  <div class="chat-view">
    <div class="chat-header">
      <div class="chat-header-info">
        <div class="status-dot" />
        <span class="chat-title">Feedback Assistent</span>
      </div>
      <span class="chat-subtitle">Hattie &amp; Timperley · Feed up / back / forward</span>
    </div>

    <div ref="scrollContainer" class="messages-area">
      <div v-if="getActiveMessages().length === 0" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 8h26v20H22l-5 5V28H7V8z" />
            <path d="M13 16h14M13 21h9" />
          </svg>
        </div>
        <p>Begin een gesprek om feedback te genereren</p>
      </div>

      <ChatMessage
        v-for="message in getActiveMessages()"
        :key="message.id"
        :message="message"
      />
    </div>

    <ChatInput
      :disabled="isLoading"
      @send="handleSend"
    />
  </div>
</template>

<style scoped>
.chat-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* Header */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--paper);
  flex-shrink: 0;
}

.chat-header-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #34c57b;
  box-shadow: 0 0 0 2px rgba(52, 197, 123, 0.25);
}

.chat-title {
  font-weight: 600;
  font-size: 0.95rem;
}

.chat-subtitle {
  font-size: 0.75rem;
  color: var(--muted);
}

/* Messages area */
.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scroll-behavior: smooth;
}

.messages-area::-webkit-scrollbar {
  width: 4px;
}
.messages-area::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 4px;
}

/* Empty state */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--muted);
  text-align: center;
  padding-bottom: 60px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  background: var(--cream);
  border-radius: 16px;
  display: grid;
  place-items: center;
  color: var(--muted);
}

.empty-icon svg {
  width: 32px;
  height: 32px;
}

.empty-state p {
  font-size: 0.88rem;
}
</style>