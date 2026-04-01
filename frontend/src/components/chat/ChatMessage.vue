<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked' 
import type { Message } from '@/types'

/**
 * Wij vangen hier het bericht-object op dat we van de ChatView doorgestuurd krijgen.
 */
const props = defineProps<{
  message: Message
}>()

/**
 * Wij zetten de datum en tijd om naar een kort en leesbaar formaat (bijv. 14:30).
 * @param date - De datum die we willen omzetten.
 */
function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/**
 * Wij stellen hier de extra opties voor de Markdown-vertaler in.
 * Zo zorgen we dat enters ook echt nieuwe regels worden in de tekst.
 */
marked.setOptions({
  breaks: true,
  gfm: true
})

/**
 * Wij bepalen hier hoe de tekst getoond moet worden.
 * Als het bericht van de docent is, laten we de tekst gewoon zoals die is.
 * Als het van de AI is, halen we het door de Markdown-vertaler voor een mooie opmaak.
 */
const formattedContent = computed(() => {
  const text = props.message.content || '';
  // Voor de gebruiker (docent) gebruiken we geen markdown.
  if (props.message.role === 'user') return text;
  
  if (text === '') return '';
  // De AI-tekst zetten we om naar HTML.
  return marked.parse(text) as string;
})
</script>

<template>
  <div class="message" :class="message.role">
    
    <div class="message-avatar">
      <span v-if="message.role !== 'user'">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="4" y="6" width="12" height="10" rx="3" />
          <path d="M8 6V4h4v2" />
          <circle cx="8" cy="11" r="1" fill="currentColor" stroke="none" />
          <circle cx="12" cy="11" r="1" fill="currentColor" stroke="none" />
          <path d="M8 14h4" />
        </svg>
      </span>
      <span v-else>
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="10" cy="7" r="3" />
          <path d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6" />
        </svg>
      </span>
    </div>

    <div class="message-body">
      <div class="message-bubble">
        
        <div v-if="message.role !== 'user' && !message.content" class="thinking-indicator">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
        
        <div v-else-if="message.role === 'user'" class="message-text user-text">
          {{ formattedContent }}
        </div>

        <div 
          v-else 
          class="message-text markdown-body" 
          v-html="formattedContent">
        </div>

      </div>
      
      <time class="message-time">{{ formatTime(message.timestamp) }}</time>
    </div>
  </div>
</template>

<style scoped>
/* Hieronder regelen wij de vormgeving, zoals de kleuren en de ronde hoekjes van de bubbels. */
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

.message-avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: #fff;
}

.message:not(.user) .message-avatar {
  background: var(--teal, #34c57b);
}

.message.user .message-avatar {
  background: var(--amber, #f59e0b);
}

.message-avatar svg {
  width: 16px;
  height: 16px;
}

.message-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 85%;
}

.message.user .message-body {
  align-items: flex-end;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 14px;
  line-height: 1.5;
  font-size: 0.95rem;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.message:not(.user) .message-bubble {
  background: #fff;
  border: 1px solid var(--border, #e5e7eb);
  color: var(--ink, #111827);
  border-top-left-radius: 4px;
}

.message.user .message-bubble {
  background: var(--amber, #f59e0b);
  color: #fff;
  border-top-right-radius: 4px;
}

.message-text {
  margin: 0;
}

.user-text {
  white-space: pre-wrap;
}

.markdown-body {
  white-space: normal; 
}

/* Wij hebben hier gezorgd dat de witruimte in de Markdown-tekst mooi strak blijft. */
.markdown-body :deep(p) {
  margin: 0 0 0.6em 0;
}
.markdown-body :deep(p:last-child) {
  margin-bottom: 0;
}

.markdown-body :deep(ul), 
.markdown-body :deep(ol) {
  margin: 0.4em 0 0.8em 0;
  padding-left: 1.5rem;
}

.markdown-body :deep(li) {
  margin-bottom: 0.3em;
}

.markdown-body :deep(li > p) {
  margin: 0;
}

.message-time {
  font-size: 0.72rem;
  color: var(--muted, #6b7280);
  padding: 0 4px;
}

/* Onze styling voor de drie springende bolletjes */
.thinking-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 22px;
}

.dot {
  width: 6px;
  height: 6px;
  background-color: var(--muted, #9ca3af);
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}
</style>