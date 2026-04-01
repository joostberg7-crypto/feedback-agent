import type { ChatSession } from '@/types'

/**
 * Dit is het basisadres waar we de chatgegevens ophalen en opslaan.
 */
const API_BASE = '/api/sessions'

/**
 * In deze service regelen we alle communicatie tussen de app en de server.
 * Wij gebruiken dit om gesprekken op te halen, aan te maken of te wissen.
 */
export const chatService = {
  /**
   * Wij halen hiermee alle opgeslagen gesprekken op van de server.
   * Zo kunnen we ze laten zien in het overzicht van de gebruiker.
   * @returns Een lijst met alle gevonden chatsessies.
   */
  async fetchAll(): Promise<ChatSession[]> {
    const res = await fetch(API_BASE)
    return res.json()
  },

  /**
   * Hiermee maken wij een gloednieuwe chatsessie aan in de database.
   * Dit gebeurt meestal wanneer er op de knop voor een nieuw gesprek wordt geklikt.
   * @returns De gegevens van de nieuwe sessie die we net hebben aangemaakt.
   */
  async create(): Promise<ChatSession> {
    const res = await fetch(API_BASE, { method: 'POST' })
    return res.json()
  },

  /**
   * Dit is de belangrijkste functie voor het chatten zelf. 
   * Wij sturen je bericht naar de server en zorgen dat het antwoord van de AI live op je scherm verschijnt.
   * Omdat we 'streaming' gebruiken, zie je de tekst woord voor woord binnenkomen in plaats van dat je lang moet wachten.
   * @param sessionId - Het unieke nummer van het gesprek waar we in zitten.
   * @param content - De tekst die de gebruiker heeft getypt.
   * @param onChunk - Een actie die we uitvoeren telkens als er een nieuw stukje tekst van de AI binnenkomt.
   */
  async sendMessageStream(sessionId: string, content: string, onChunk: (text: string) => void) {
    const response = await fetch(`/api/sessions/${sessionId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) return;

    // We blijven luisteren naar de server tot het hele bericht binnen is.
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // We vertalen de binnengekomen data naar leesbare tekst.
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        // We zoeken naar regels die beginnen met 'data: ' (het SSE-formaat).
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          
          try {
            // We halen het stukje tekst uit het JSON-pakketje en sturen het door naar de app.
            const parsed = JSON.parse(data);
            onChunk(parsed.content);
          } catch (e) {
            // Als er een foutje in de data zit, negeren we dat stukje gewoon.
          }
        }
      }
    }
  },

  /**
   * Als wij een gesprek willen weggooien, gebruiken we deze functie.
   * Het gesprek wordt dan definitief uit de database verwijderd.
   * @param id - Het unieke nummer van het gesprek dat weg moet.
   */
  async delete(id: string): Promise<void> {
    await fetch(`${API_BASE}/${id}`, { method: 'DELETE' })
  }
}