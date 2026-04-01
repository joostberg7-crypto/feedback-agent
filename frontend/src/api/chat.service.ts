import type { ChatSession } from '@/types'

const API_BASE = '/api/sessions'

export const chatService = {
  async fetchAll(): Promise<ChatSession[]> {
    const res = await fetch(API_BASE)
    return res.json()
  },

  async create(): Promise<ChatSession> {
    const res = await fetch(API_BASE, { method: 'POST' })
    return res.json()
  },

  async sendMessage(sessionId: string, content: string) {
    // Voor nu gewone fetch, straks passen we dit aan voor SSE (streaming)
    const res = await fetch(`${API_BASE}/${sessionId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    })
    return res.json()
  },

  async delete(id: string): Promise<void> {
    await fetch(`${API_BASE}/${id}`, { method: 'DELETE' })
  }
}