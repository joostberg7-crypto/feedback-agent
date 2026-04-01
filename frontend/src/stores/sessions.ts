import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ChatSession } from '@/types'

export const useSessionsStore = defineStore('sessions', () => {
  const allSessions = ref<ChatSession[]>([])
  const activeSessionId = ref<string | null>(null)

  async function fetchAllSessions() {
    try {
      const res = await fetch('/api/sessions')
      const data = await res.json()
      
      allSessions.value = data.map((s: any) => ({
        ...s,
        // Zorg dat we een 'id' veld hebben voor de frontend
        id: s.id || s._id, 
        language: 'nl',
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt || s.createdAt),
        messages: (s.messages || []).map((m: any) => ({
          ...m,
          // Gebruik de timestamp van MongoDB
          timestamp: new Date(m.timestamp || m.createdAt || Date.now())
        }))
      }))
    } catch (err) {
      console.error("Fout bij ophalen sessies:", err)
    }
  }

  async function createNewSession() {
    const res = await fetch('/api/sessions', { method: 'POST' })
    const newSession = await res.json()
    
    const formattedSession: ChatSession = {
      ...newSession,
      id: newSession.id || newSession._id, // Vertaling voor MongoDB
      language: 'nl',
      createdAt: new Date(newSession.createdAt),
      updatedAt: new Date(newSession.updatedAt || newSession.createdAt),
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
    // Zoek op het gemapte 'id' veld
    return allSessions.value.find((s) => (s.id || (s as any)._id) === activeSessionId.value) || null
  }

  async function deleteSession(id: string) {
    await fetch(`/api/sessions/${id}`, { method: 'DELETE' })
    allSessions.value = allSessions.value.filter((s) => (s.id || (s as any)._id) !== id)
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