<script setup lang="ts">
import type { ChatSession } from '@/types'

/** The session data this card should display */
const props = defineProps<{
  session: ChatSession
  isActive: boolean
}>()

/**
 * Events this card can fire:
 * - select: the teacher clicked the card to open the session
 * - delete: the teacher clicked the trash icon to delete the session
 */
const emit = defineEmits<{
  select: [id: string]
  delete: [id: string]
}>()

/**
 * Formats a Date into a short readable string.
 * Example output: "12 mrt, 09:45"
 *
 * @param date - The date to format
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('nl-NL', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
</script>

<template>
  <!-- The whole card is clickable to open the session -->
  <div
    class="session-card"
    :class="{ active: isActive }"
    role="button"
    tabindex="0"
    @click="emit('select', session.id)"
    @keydown.enter="emit('select', session.id)"
  >
    <!-- Left side: title and small info line -->
    <div class="card-info">
      <p class="card-title">{{ session.title }}</p>
      <span class="card-meta">
        {{ session.messages.length }} berichten &nbsp;·&nbsp; {{ formatDate(session.updatedAt) }}
      </span>
    </div>

    <!-- Language badge (NL / EN / MIXED) -->
    <span class="lang-badge" :class="session.language">
      {{ session.language.toUpperCase() }}
    </span>

    <!-- Delete button — .stop prevents the card click from also firing -->
    <button
      class="delete-btn"
      title="Verwijder sessie"
      aria-label="Verwijder sessie"
      @click.stop="emit('delete', session.id)"
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M3 4h10M6 4V3h4v1M5 4l.5 9h5l.5-9" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
/* The card container */
.session-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 15px;
  border-radius: 10px;
  border: 1.5px solid var(--border);
  background: #fff;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}

/* Hover state */
.session-card:hover {
  border-color: var(--amber);
  box-shadow: var(--shadow);
}

/* The card that is currently open gets an amber background tint */
.session-card.active {
  border-color: var(--amber);
  background: var(--amber-pale);
}

/* Left text block — takes all remaining space */
.card-info {
  flex: 1;
  min-width: 0;
}

/* Session title */
.card-title {
  font-size: 0.88rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 3px;
}

/* Small grey info line below the title */
.card-meta {
  font-size: 0.72rem;
  color: var(--muted);
}

/* Language badge */
.lang-badge {
  font-size: 0.65rem;
  font-weight: 700;
  font-family: 'DM Mono', monospace;
  padding: 3px 7px;
  border-radius: 5px;
  flex-shrink: 0;
}

/* Different colours per language */
.lang-badge.nl    { background: var(--teal-light); color: var(--teal); }
.lang-badge.en    { background: #e8eef8;            color: #2a5298;     }
.lang-badge.mixed { background: var(--cream);       color: var(--muted);}

/* Small trash icon button */
.delete-btn {
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  display: grid;
  place-items: center;
  color: var(--muted);
  transition: background 0.12s, color 0.12s;
  flex-shrink: 0;
}

.delete-btn:hover {
  background: #fdecea;
  color: #c0392b;
}

.delete-btn svg {
  width: 13px;
  height: 13px;
}
</style>