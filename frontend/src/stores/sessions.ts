import { defineStore } from 'pinia'
import { ref } from 'vue'
import { chatService } from '@/api/chat.service'
import type { ChatSession } from '@/types'

export const useSessionsStore = defineStore('sessions', () => {
  const allSessions = ref<ChatSession[]>([])
  const activeSessionId = ref<string | null>(null)

  async function fetchAllSessions() {
    try {
      const data = await chatService.fetchAll()
      allSessions.value = data.map(s => ({
        ...s,
        id: s.id || (s as any)._id,
        language: 'nl',
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt || s.createdAt),
        messages: (s.messages || []).map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp || Date.now())
        }))
      }))
    } catch (err) {
      console.error("Fout bij ophalen:", err)
    }
  }

  async function createNewSession() {
    const session = await chatService.create()
    const formatted: ChatSession = {
      ...session,
      id: session.id || (session as any)._id,
      language: 'nl',
      createdAt: new Date(session.createdAt),
      updatedAt: new Date(session.updatedAt || session.createdAt),
      messages: []
    }
    allSessions.value.unshift(formatted)
    activeSessionId.value = formatted.id
    return formatted
  }

  function setActiveSession(id: string) {
    activeSessionId.value = id
  }

  function getActiveSession(): ChatSession | null {
    return allSessions.value.find(s => s.id === activeSessionId.value) || null
  }

  async function deleteSession(id: string) {
    await chatService.delete(id)
    allSessions.value = allSessions.value.filter(s => s.id !== id)
    if (activeSessionId.value === id) activeSessionId.value = null
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