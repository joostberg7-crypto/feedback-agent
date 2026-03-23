// ── Language ──────────────────────────────────────────────────────────────────
export type Lang = 'NL' | 'EN'

// ── Message & Chat types ──────────────────────────────────────

export type MessageRole = 'user' | 'agent'

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  isStreaming?: boolean
}

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  language: 'nl' | 'en' | 'mixed'
}

export interface FeedbackDraft {
  sessionId: string
  feedUp: string
  feedBack: string
  feedForward: string
  level: 'task' | 'process' | 'self-regulation' | 'self'
  language: 'nl' | 'en'
  approved: boolean
}