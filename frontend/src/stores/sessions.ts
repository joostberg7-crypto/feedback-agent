import { defineStore } from 'pinia'
import { ref } from 'vue'
import { chatService } from '@/api/chat.service'
import type { ChatSession } from '@/types'

/**
 * In deze store houden we alle chatsessies bij die in de app worden gebruikt.
 * We zorgen ervoor dat we overal in de app bij de lijst met sessies kunnen
 * en dat we weten welk gesprek er op dit moment open staat.
 */
export const useSessionsStore = defineStore('sessions', () => {
  // Hier bewaren we de volledige lijst met alle gesprekken.
  const allSessions = ref<ChatSession[]>([])
  
  // Hier onthouden we het unieke ID van het gesprek dat de gebruiker nu bekijkt.
  const activeSessionId = ref<string | null>(null)

  /**
   * We halen hier alle sessies op van de server.
   * We zorgen er ook voor dat de data (zoals datums en ID's) direct in het juiste 
   * formaat worden gezet, zodat we er in de rest van de app makkelijk mee kunnen werken.
   */
  async function fetchAllSessions() {
    try {
      const data = await chatService.fetchAll()
      allSessions.value = data.map(s => ({
        ...s,
        // We zorgen dat we altijd een 'id' hebben, ook als de database '_id' gebruikt.
        id: s.id || (s as any)._id,
        language: 'nl',
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt || s.createdAt),
        // We zetten de tijdstempels van alle berichten om naar echte datum-objecten.
        messages: (s.messages || []).map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp || Date.now())
        }))
      }))
    } catch (err) {
      console.error("Fout bij ophalen:", err)
    }
  }

  /**
   * We maken hiermee een nieuw, leeg gesprek aan.
   * Het nieuwe gesprek wordt direct bovenaan de lijst gezet en we maken het meteen actief.
   * @returns De gegevens van het nieuwe gesprek.
   */
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
    // We voegen de nieuwe sessie toe aan het begin van onze lijst.
    allSessions.value.unshift(formatted)
    activeSessionId.value = formatted.id
    return formatted
  }

  /**
   * Hiermee stellen we in welk gesprek de gebruiker op dit moment wil zien.
   * @param id - Het ID van de geselecteerde sessie.
   */
  function setActiveSession(id: string) {
    activeSessionId.value = id
  }

  /**
   * We zoeken hiermee de volledige gegevens op van het gesprek dat nu actief is.
   * @returns De actieve sessie, of niks als er geen gesprek open staat.
   */
  function getActiveSession(): ChatSession | null {
    return allSessions.value.find(s => s.id === activeSessionId.value) || null
  }

  /**
   * We verwijderen hiermee een gesprek definitief.
   * We wissen het zowel op de server als in onze eigen lijst in de app.
   * @param id - Het ID van de sessie die weg moet.
   */
  async function deleteSession(id: string) {
    await chatService.delete(id)
    allSessions.value = allSessions.value.filter(s => s.id !== id)
    // Als we het gesprek wissen dat we net open hadden, zetten we de actieve sessie op leeg.
    if (activeSessionId.value === id) activeSessionId.value = null
  }

  /**
   * Deze functie gebruiken we tijdens het live streamen van een AI-antwoord.
   * We plakken elk nieuw binnengekomen stukje tekst direct achteraan het laatste bericht van de agent.
   * @param sessionId - De sessie waar het om gaat.
   * @param chunk - Het nieuwe stukje tekst dat we hebben ontvangen.
   */
  function updateLastMessageContent(sessionId: string, chunk: string) {
    const session = allSessions.value.find(s => s.id === sessionId)
    if (session && session.messages.length > 0) {
      const lastMessage = session.messages[session.messages.length - 1]
      // We voegen de tekst alleen toe als het laatste bericht ook echt van de AI komt.
      if (lastMessage.role === 'agent') {
        lastMessage.content += chunk
      }
    }
  }

  // We geven alle functies en variabelen terug zodat ze in de rest van de app gebruikt kunnen worden.
  return {
    allSessions,
    activeSessionId,
    fetchAllSessions,
    createNewSession,
    setActiveSession,
    getActiveSession,
    deleteSession,
    updateLastMessageContent
  }
})