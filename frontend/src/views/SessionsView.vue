<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useSessionsStore } from '@/stores/sessions'
import SessionCard from '@/components/sessions/SessionCard.vue'

const router = useRouter()
const store = useSessionsStore()

/**
 * Returns all sessions sorted by most-recently-updated first.
 * We make a copy with [...] so we don't accidentally mutate the store array.
 */
function getSortedSessions() {
  return [...store.allSessions].sort((a, b) => {
    // Gebruik createdAt als updatedAt niet bestaat om crashes te voorkomen
    const timeA = (b.updatedAt || b.createdAt).getTime()
    const timeB = (a.updatedAt || a.createdAt).getTime()
    return timeA - timeB
  })
}

/**
 * Opens an existing session in the chat view.
 * Sets the session as active and navigates to the chat page.
 *
 * @param id - The ID of the session the teacher clicked
 */
function openSession(id: string) {
  store.setActiveSession(id)
  router.push('/')
}

/**
 * Creates a brand new empty session and navigates to the chat view.
 * The store will automatically set the new session as active.
 */
async function startNewSession() {
  // Wacht tot de store en dus de database klaar is
  const newSession = await store.createNewSession()
  
  // Zet de nieuwe sessie direct op actief
  store.setActiveSession(newSession.id)
  
  // Ga nu pas naar de chat-interface
  router.push('/')
}

/**
 * Deletes a session after the teacher clicks the trash icon on a card.
 *
 * @param id - The ID of the session to delete
 */
function removeSession(id: string) {
  store.deleteSession(id)
}
</script>

<template>
  <div class="sessions-view">

    <!-- Page header with title and "New session" button -->
    <div class="page-header">
      <div class="header-text">
        <h1 class="page-title">Sessies</h1>
        <p class="page-subtitle">Alle opgeslagen gesprekken en feedbackdrafts</p>
      </div>

      <button class="new-session-btn" @click="startNewSession">
        <!-- Plus icon -->
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        >
          <path d="M8 3v10M3 8h10" />
        </svg>
        Nieuw gesprek
      </button>
    </div>

    <!-- Empty state: shown when the teacher has no sessions yet -->
    <div v-if="store.allSessions.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg
          viewBox="0 0 40 40"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="6" y="6" width="28" height="28" rx="4" />
          <path d="M13 14h14M13 20h14M13 26h8" />
        </svg>
      </div>
      <p class="empty-text">Nog geen sessies opgeslagen.</p>
      <button class="new-session-btn" @click="startNewSession">
        Start eerste gesprek
      </button>
    </div>

    <!-- Session list: one card per session -->
    <div v-else class="session-list">
      <SessionCard
        v-for="session in getSortedSessions()"
        :key="session.id"
        :session="session"
        :is-active="session.id === store.activeSessionId"
        @select="openSession"
        @delete="removeSession"
      />
    </div>

  </div>
</template>

<style scoped>
/* Outer wrapper with comfortable reading width */
.sessions-view {
  padding: 32px;
  max-width: 780px;
  width: 100%;
  margin: 0 auto;
}

/* Top row: title on the left, button on the right */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 28px;
}

.page-title {
  font-size: 1.45rem;
  font-weight: 800;
  margin-bottom: 4px;
}

.page-subtitle {
  font-size: 0.8rem;
  color: var(--muted);
}

/* Amber "new session" button */
.new-session-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 18px;
  background: var(--amber);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;
}

.new-session-btn:hover {
  background: var(--amber-light);
}

.new-session-btn svg {
  width: 14px;
  height: 14px;
}

/* Vertically stacked list of cards */
.session-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Centred placeholder when there are no sessions */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 64px 0;
  color: var(--muted);
  text-align: center;
}

.empty-icon {
  width: 72px;
  height: 72px;
  background: var(--cream);
  border-radius: 18px;
  display: grid;
  place-items: center;
}

.empty-icon svg {
  width: 36px;
  height: 36px;
}

.empty-text {
  font-size: 0.88rem;
}
</style>