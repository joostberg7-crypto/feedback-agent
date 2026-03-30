<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { useSessionsStore } from '@/stores/sessions'
import ChatMessage from '@/components/chat/ChatMessage.vue'
import ChatInput from '@/components/chat/ChatInput.vue'
import type { Message } from '@/types'

const store = useSessionsStore()
const isLoading = ref(false)
const scrollContainer = ref<HTMLElement | null>(null)

/**
 * Returns the messages that belong to the currently active session.
 * Returns an empty array when no session is open yet.
 */
function getActiveMessages(): Message[] {
  const session = store.getActiveSession()
  if (session === null) {
    return []
  }
  return session.messages
}

/**
 * Waits for Vue to update the DOM and then scrolls the message list
 * all the way to the bottom so the latest message is always visible.
 */
async function scrollToBottom() {
  await nextTick()
  if (scrollContainer.value !== null) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
  }
}

/**
 * Runs once when the component loads.
 * Makes sure there is always an active session open.
 * If the active session is brand new (0 messages), we add the welcome message.
 */
onMounted(() => {
  // If no session is open yet, create a new one
  const existingSession = store.getActiveSession()
  if (existingSession === null) {
    store.createNewSession()
  }

  // Add the welcome message only to a fresh empty session
  const currentSession = store.getActiveSession()
  if (currentSession !== null && currentSession.messages.length === 0) {
    store.addMessageToSession(currentSession.id, {
      id: crypto.randomUUID(),
      role: 'agent',
      content:
        'Hallo! Ik ben je feedback-agent. Plak of beschrijf een gesprek met een student, ' +
        'en ik help je om geschreven feedback op te stellen op basis van Hattie & Timperley.\n\n' +
        "You can also write in English — I'll follow your language.",
      timestamp: new Date(),
    })
  }
})

/**
 * Called when the teacher submits a message in the chat input.
 * Steps:
 * 1. Save the teacher's message to the session
 * 2. Add a temporary empty "agent thinking" message
 * 3. Call the Anthropic API
 * 4. Fill in the agent's reply once the API responds
 *
 * @param content - The text the teacher typed and submitted
 */
async function handleSend(content: string) {
  const sessionId = store.activeSessionId
  // Do nothing if somehow no session is active
  if (sessionId === null) {
    return
  }

  // Step 1 — save and show the teacher's message
  const userMessage: Message = {
    id: crypto.randomUUID(),
    role: 'user',
    content: content,
    timestamp: new Date(),
  }
  store.addMessageToSession(sessionId, userMessage)
  await scrollToBottom()

  // Step 2 — add a placeholder for the agent's reply while we wait for the API
  const agentMessageId = crypto.randomUUID()
  const agentPlaceholder: Message = {
    id: agentMessageId,
    role: 'agent',
    content: '',
    timestamp: new Date(),
    isStreaming: true, // This shows the blinking cursor
  }
  store.addMessageToSession(sessionId, agentPlaceholder)
  isLoading.value = true
  await scrollToBottom()

  // Step 3 — call the Anthropic API
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
        // Only send user messages to the API — agent messages are local
        messages: getActiveMessages()
          .filter((m) => m.role === 'user')
          .map((m) => ({ role: m.role, content: m.content })),
      }),
    })

    const responseData = await response.json()
    // Pull the text out of the API response
    const replyText =
      responseData.content?.find((block: { type: string }) => block.type === 'text')?.text ?? '...'

    // Step 4 — replace the placeholder with the real reply
    store.updateMessageInSession(sessionId, agentMessageId, {
      content: replyText,
      isStreaming: false,
    })
  } catch (error) {
    // If anything goes wrong, show a simple error message instead
    store.updateMessageInSession(sessionId, agentMessageId, {
      content: 'Er is iets misgegaan. Probeer het opnieuw.',
      isStreaming: false,
    })
  } finally {
    // Always turn off the loading state, whether it succeeded or failed
    isLoading.value = false
    await scrollToBottom()
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