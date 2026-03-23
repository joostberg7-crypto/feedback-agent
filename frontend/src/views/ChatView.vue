<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import ChatMessage from '@/components/chat/ChatMessage.vue'
import ChatInput from '@/components/chat/ChatInput.vue'
import type { Message } from '@/types'

// ── State ────────────────────────────────────────────────────
const messages = ref<Message[]>([])
const isLoading = ref(false)
const scrollContainer = ref<HTMLElement | null>(null)

// ── Init with welcome message ─────────────────────────────────
onMounted(() => {
  messages.value.push({
    id: crypto.randomUUID(),
    role: 'agent',
    content:
      'Hallo! Ik ben je feedback-agent. Plak of beschrijf een gesprek met een student, en ik help je om geschreven feedback op te stellen op basis van Hattie & Timperley.\n\nYou can also write in English — I\'ll follow your language.',
    timestamp: new Date(),
  })
})

// ── Scroll helpers ────────────────────────────────────────────
async function scrollToBottom() {
  await nextTick()
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
  }
}

// ── Send message ──────────────────────────────────────────────
async function handleSend(content: string) {
  // Add user message
  messages.value.push({
    id: crypto.randomUUID(),
    role: 'user',
    content,
    timestamp: new Date(),
  })
  await scrollToBottom()

  // Add streaming placeholder
  const assistantId = crypto.randomUUID()
  messages.value.push({
    id: assistantId,
    role: 'agent',
    content: '',
    timestamp: new Date(),
    isStreaming: true,
  })
  isLoading.value = true
  await scrollToBottom()

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: `Je bent een feedback-agent voor HBO-ICT docenten. Je helpt docenten om schriftelijke feedback te formuleren op basis van gesprekken met studenten.

Gebruik de feedbackprincipes van Hattie & Timperley:
- Feed up: Waar werkt de student naartoe? (leerdoelen)
- Feed back: Hoe gaat het nu ten opzichte van het doel?
- Feed forward: Wat zijn concrete volgende stappen?

Richt je feedback altijd op het PROCES en ZELFREGULATIE (niet op de persoon of alleen de taak).

Detecteer automatisch of de gebruiker Nederlands of Engels schrijft en antwoord in dezelfde taal.`,
        messages: messages.value
          .filter(m => !m.isStreaming && m.role !== 'agent' || m.role === 'user')
          .filter(m => m.role === 'user')
          .map(m => ({ role: m.role, content: m.content })),
      }),
    })

    const data = await response.json()
    const reply =
      data.content?.find((b: { type: string }) => b.type === 'text')?.text ?? '...'

    // Update the streaming message
    const idx = messages.value.findIndex(m => m.id === assistantId)
    if (idx !== -1) {
      messages.value[idx] = {
        ...messages.value[idx],
        content: reply,
        isStreaming: false,
      }
    }
  } catch (err) {
    const idx = messages.value.findIndex(m => m.id === assistantId)
    if (idx !== -1) {
      messages.value[idx] = {
        ...messages.value[idx],
        content: 'Er is iets misgegaan. Probeer het opnieuw.',
        isStreaming: false,
      }
    }
  } finally {
    isLoading.value = false
    await scrollToBottom()
  }
}
</script>

<template>
  <div class="chat-view">
    <!-- Header bar -->
    <div class="chat-header">
      <div class="chat-header-info">
        <div class="status-dot" />
        <span class="chat-title">Feedback Assistent</span>
      </div>
      <span class="chat-subtitle">Hattie &amp; Timperley · Feed up / back / forward</span>
    </div>

    <!-- Messages -->
    <div ref="scrollContainer" class="messages-area">
      <div v-if="messages.length === 0" class="empty-state">
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
        v-for="message in messages"
        :key="message.id"
        :message="message"
      />
    </div>

    <!-- Input -->
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