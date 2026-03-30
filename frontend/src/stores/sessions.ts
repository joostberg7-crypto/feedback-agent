import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { ChatSession, Message } from '@/types'

/** The key we use to save sessions in the browser's localStorage */
const STORAGE_KEY = 'feedback_agent_sessions'

/**
 * Reads all saved sessions from localStorage.
 * If nothing is saved yet, returns an empty list.
 * Dates are stored as plain strings in JSON, so we convert them back to Date objects.
 */
function readSessionsFromStorage(): ChatSession[] {
  const savedData = localStorage.getItem(STORAGE_KEY)

  // Nothing saved yet — just return an empty list
  if (!savedData) {
    return []
  }

  // Parse the JSON string back into an array of sessions
  const parsedSessions = JSON.parse(savedData) as ChatSession[]

  // JSON does not keep Date objects — they become plain strings.
  // We loop through every session and every message and convert them back.
  const sessionsWithRealDates = parsedSessions.map((session) => {
    const messagesWithRealDates = session.messages.map((message) => {
      return {
        ...message,
        timestamp: new Date(message.timestamp),
      }
    })

    return {
      ...session,
      createdAt: new Date(session.createdAt),
      updatedAt: new Date(session.updatedAt),
      messages: messagesWithRealDates,
    }
  })

  return sessionsWithRealDates
}

/**
 * Saves all sessions to localStorage so they survive page refreshes.
 * JSON.stringify handles the conversion from objects to a string automatically.
 */
function saveSessionsToStorage(sessions: ChatSession[]) {
  const dataAsString = JSON.stringify(sessions)
  localStorage.setItem(STORAGE_KEY, dataAsString)
}

/**
 * The sessions store.
 * This is the single place where all chat sessions are kept.
 * Components can read from it and call its actions to make changes.
 */
export const useSessionsStore = defineStore('sessions', () => {
  // ── State ──────────────────────────────────────────────────────────────────

  /** All sessions the teacher has had. Loaded from localStorage on startup. */
  const allSessions = ref<ChatSession[]>(readSessionsFromStorage())

  /**
   * The ID of the session that is currently open in the chat view.
   * null means no session is open yet.
   */
  const activeSessionId = ref<string | null>(null)

  // ── Auto-save ──────────────────────────────────────────────────────────────

  /**
   * Every time allSessions changes (new session, new message, etc.),
   * we automatically save the updated list to localStorage.
   * { deep: true } means Vue will also watch changes inside the array items.
   */
  watch(
    allSessions,
    (updatedSessions) => {
      saveSessionsToStorage(updatedSessions)
    },
    { deep: true }
  )

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Finds one session by its ID.
   * Returns the session object, or null if it cannot be found.
   *
   * @param id - The unique ID of the session to find
   */
  function getSessionById(id: string): ChatSession | null {
    const found = allSessions.value.find((session) => session.id === id)
    return found ?? null
  }

  /**
   * Returns the session that is currently open in the chat view.
   * Returns null if no session is active.
   */
  function getActiveSession(): ChatSession | null {
    if (activeSessionId.value === null) {
      return null
    }
    return getSessionById(activeSessionId.value)
  }

  /**
   * Creates a brand new empty session and adds it to the top of the list.
   * Also marks the new session as the active one so the chat view opens it.
   *
   * @returns The newly created session object
   */
  function createNewSession(): ChatSession {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: 'Nieuw gesprek',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      language: 'nl',
    }

    // Add the new session at the very top of the list
    allSessions.value.unshift(newSession)

    // Open this session right away
    activeSessionId.value = newSession.id

    return newSession
  }

  /**
   * Opens an existing session in the chat view.
   *
   * @param id - The ID of the session to open
   */
  function setActiveSession(id: string) {
    activeSessionId.value = id
  }

  /**
   * Adds a new message to a session.
   * Also updates the session's "last updated" time.
   * If the session still has the default title, we use the first user
   * message to give it a more meaningful title automatically.
   *
   * @param sessionId - Which session to add the message to
   * @param message   - The message object to add
   */
  function addMessageToSession(sessionId: string, message: Message) {
    const session = getSessionById(sessionId)

    // Safety check — do nothing if the session does not exist
    if (session === null) {
      return
    }

    // Add the message at the end of the conversation
    session.messages.push(message)

    // Update the timestamp so the list stays sorted correctly
    session.updatedAt = new Date()

    // Auto-title: use the first user message as the session title
    const isStillDefaultTitle = session.title === 'Nieuw gesprek'
    const isUserMessage = message.role === 'user'

    if (isStillDefaultTitle && isUserMessage) {
      const maxLength = 50
      const isTooLong = message.content.length > maxLength

      session.title = isTooLong
        ? message.content.slice(0, maxLength) + '…'
        : message.content
    }
  }

  /**
   * Updates a specific message inside a session.
   * We use this to fill in the agent's reply once the API responds,
   * and to turn off the loading/streaming indicator.
   *
   * @param sessionId - Which session the message belongs to
   * @param messageId - The unique ID of the message to update
   * @param changes   - Only the fields you want to change (partial update)
   */
  function updateMessageInSession(
    sessionId: string,
    messageId: string,
    changes: Partial<Message>
  ) {
    const session = getSessionById(sessionId)

    if (session === null) {
      return
    }

    // Find the position of the message in the array
    const messageIndex = session.messages.findIndex((m) => m.id === messageId)

    if (messageIndex === -1) {
      return
    }

    // Merge the existing message with the new changes
    session.messages[messageIndex] = {
      ...session.messages[messageIndex],
      ...changes,
    }
  }

  /**
   * Permanently removes a session from the list.
   * If the deleted session was the active one, we clear the active session.
   *
   * @param id - The ID of the session to delete
   */
  function deleteSession(id: string) {
    // Keep all sessions except the one we want to delete
    allSessions.value = allSessions.value.filter((session) => session.id !== id)

    // If we just deleted the open session, close it
    if (activeSessionId.value === id) {
      activeSessionId.value = null
    }
  }

  // ── Return everything the components need ──────────────────────────────────

  return {
    allSessions,
    activeSessionId,
    getSessionById,
    getActiveSession,
    createNewSession,
    setActiveSession,
    addMessageToSession,
    updateMessageInSession,
    deleteSession,
  }
})