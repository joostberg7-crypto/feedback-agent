<script setup lang="ts">
import { ref, nextTick, watch, computed, onMounted } from 'vue'
import { useSessionsStore } from '@/stores/sessions'
import ChatMessage from '@/components/chat/ChatMessage.vue'
import ChatInput from '@/components/chat/ChatInput.vue'
import { chatService } from '@/api/chat.service'

/**
 * We halen de store erbij zodat we bij alle gesprekken kunnen.
 * Ook houden we hier bij of de AI nog aan het nadenken is en waar we in de lijst staan.
 */
const store = useSessionsStore()
const isLoading = ref(false)
const scrollContainer = ref<HTMLElement | null>(null)

/**
 * We kijken hier continu welk gesprek er open staat en welke berichtjes daarbij horen.
 * Zo zorgen we dat we altijd de juiste tekst op het scherm laten zien.
 */
const getActiveMessages = computed(() => {
  const session = store.getActiveSession()
  return session ? session.messages : []
})

/**
 * Wij zorgen ervoor dat het scherm automatisch naar beneden zakt.
 * Zo zie je altijd het allernieuwste berichtje zonder dat je zelf hoeft te scrollen.
 */
async function scrollToBottom() {
  await nextTick()
  if (scrollContainer.value) {
    scrollContainer.value.scrollTo({
      top: scrollContainer.value.scrollHeight,
      behavior: 'smooth'
    })
  }
}

/**
 * Wij houden de lijst met berichtjes goed in de gaten.
 * Zodra er een berichtje bijkomt of als we van gesprek wisselen, scrollen we direct omlaag.
 */
watch(() => getActiveMessages.value.length, scrollToBottom)
watch(() => store.activeSessionId, scrollToBottom)

// Als we de pagina voor het eerst openen, zorgen we ook dat we onderaan beginnen.
onMounted(scrollToBottom)

/**
 * Dit is de functie die we gebruiken als je een berichtje verstuurt.
 * 1. We zetten jouw tekst in het scherm.
 * 2. We maken alvast een plekje vrij voor de AI.
 * 3. We halen de tekst live op bij de AI en laten die woord voor woord verschijnen.
 * @param content - De tekst die de gebruiker naar de assistent stuurt.
 */
async function handleSend(content: string) {
  const session = store.getActiveSession()
  if (!session || isLoading.value) return

  isLoading.value = true

  // Wij voegen eerst jouw eigen berichtje toe aan het gesprek.
  session.messages.push({
    id: Date.now().toString(),
    role: 'user', 
    content,
    timestamp: new Date()
  })

  // We maken een leeg berichtje aan voor de agent waar de tekst live in kan 'stromen'.
  const agentMessageId = 'streaming-' + Date.now();
  session.messages.push({
    id: agentMessageId,
    role: 'agent', 
    content: '',
    isStreaming: true, // Hiermee weten we dat de AI nog bezig is.
    timestamp: new Date()
  })

  await scrollToBottom()

  // Wij starten hier de verbinding om het antwoord van de AI live binnen te krijgen.
  try {
    await chatService.sendMessageStream(
      session.id, 
      content, 
      (chunk) => {
        // Telkens als er een nieuw woordje komt, voegen we dat toe en scrollen we mee.
        store.updateLastMessageContent(session.id, chunk)
        scrollToBottom()
      }
    )
    
    // Als de AI klaar is, zetten we het 'streamen' uit.
    const lastMsg = session.messages.find(m => m.id === agentMessageId);
    if (lastMsg) lastMsg.isStreaming = false;

  } catch (error) {
    console.error("Er ging iets mis tijdens het chatten:", error)
  } finally {
    isLoading.value = false
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
      <div v-if="getActiveMessages.length === 0" class="empty-state">
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
        v-for="message in getActiveMessages"
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
/* Hieronder staan de stijlen die zorgen dat de chat er op elk scherm goed uitziet */
.chat-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

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