import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * We halen onze geheime API-sleutel op uit de instellingen.
 * Hiermee krijgen we toegang tot de servers van Google om de AI te gebruiken.
 */
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || '');

/**
 * Hier configureren we het AI-brein van onze assistent.
 * We geven de model een duidelijke rol:
 * Het moet docenten en studenten van de HvA helpen met feedback volgens Hattie & Timperley.
 */
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  systemInstruction: "Je bent een Feedback Assistent voor de HvA. Help docenten en leerlingen met constructieve feedback volgens de principes van Hattie & Timperley."
});

/**
 * Dit is onze centrale service voor alles wat met de Gemini AI te maken heeft.
 */
export const geminiService = {
  /**
   * We gebruiken deze functie om een interactief gesprek met de AI te voeren.
   * We sturen de oude berichten mee zodat de AI weet waar het gesprek over gaat.
   * De AI stuurt zijn antwoord in een 'stream' terug, waardoor we de tekst live kunnen tonen.
   * * @param history - De lijst met alle berichten die tot nu toe in de chat zijn gestuurd.
   * @param newMessage - De nieuwe tekst die de gebruiker zojuist heeft verzonden.
   * @returns Een stroom (stream) van data die het antwoord van de AI bevat.
   */
  async generateChatStream(history: any[], newMessage: string) {
    try {
      // We zetten onze eigen bericht-rollen om naar de termen die Google begrijpt.
      // Wat wij een 'agent' noemen, noemt Google in hun systeem een 'model'.
      const chat = model.startChat({
        history: history.map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        })),
      });

      // We vragen de AI om een reactie te geven op het nieuwe bericht van de gebruiker.
      const result = await chat.sendMessageStream(newMessage);
      return result.stream;
    } catch (error) {
      // Mocht er iets misgaan in de communicatie met Google, dan loggen we de fout hier.
      console.error("Gemini Service Error:", error);
      throw error;
    }
  }
};