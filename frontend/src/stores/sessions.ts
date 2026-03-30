import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ChatSession } from '@/types'

export const useSessionsStore = defineStore('sessions', () => {
  const allSessions = ref<ChatSession[]>([])
  const activeSessionId = ref<string | null>(null)

  // Haal live data uit de database
  async function fetchAllSessions() {
    const res = await fetch('/api/sessions')
    const data = await res.json()
    
    allSessions.value = data.map((s: any) => ({
      ...s,
      language: 'nl',
      createdAt: new Date(s.createdAt),
      updatedAt: new Date(s.updatedAt),
      messages: s.messages.map((m: any) => ({
        ...m,
        timestamp: new Date(m.createdAt)
      }))
    }))
  }

  async function createNewSession() {
    const res = await fetch('/api/sessions', { method: 'POST' })
    const newSession = await res.json()
    
    const formattedSession: ChatSession = {
      ...newSession,
      language: 'nl',
      createdAt: new Date(newSession.createdAt),
      updatedAt: new Date(newSession.updatedAt),
      messages: []
    }
    
    allSessions.value.unshift(formattedSession)
    activeSessionId.value = formattedSession.id
    return formattedSession
  }

  function setActiveSession(id: string) {
    activeSessionId.value = id
  }

  function getActiveSession(): ChatSession | null {
    return allSessions.value.find((s) => s.id === activeSessionId.value) || null
  }

  async function deleteSession(id: string) {
    await fetch(`/api/sessions/${id}`, { method: 'DELETE' })
    allSessions.value = allSessions.value.filter((s) => s.id !== id)
    if (activeSessionId.value === id) {
      activeSessionId.value = null
    }
  }

  return {
    allSessions,
    activeSessionId,
    fetchAllSessions,
    createNewSession,
    setActiveSession,
    getActiveSession,
    deleteSession
  }
})