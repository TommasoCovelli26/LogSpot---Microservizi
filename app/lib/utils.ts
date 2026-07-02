/**
 * Formatta una stringa di data in un formato localizzato (italiano di default).
 * Gestisce vari formati di input come ISO, timestamp, ecc.
 * @param dateString - La stringa della data da formattare (può essere null o undefined)
 * @param locale - Il locale da usare per la formattazione (default: 'it-IT' per il formato italiano)
 * @returns La data formattata come stringa, oppure '—' se l'input è nullo/undefined
 */
export function formatDateToLocal(
  dateString: string | null | undefined, // Accetta stringhe, null o undefined come input
  locale: string = 'it-IT' // Parametro opzionale per il locale, default italiano
): string {
  // Se la stringa della data è null, undefined o vuota, restituisce un trattino lungo
  if (!dateString) return '—';

  try {
    // Crea un oggetto Date a partire dalla stringa ricevuta
    const date = new Date(dateString);
    // Verifica se la data creata è valida controllando che getTime() non restituisca NaN
    if (isNaN(date.getTime())) return dateString;

    // Restituisce la data formattata nel locale specificato con anno numerico, mese e giorno a 2 cifre
    return date.toLocaleDateString(locale, {
      year: 'numeric',   // Anno in formato numerico completo (es. 2026)
      month: '2-digit',  // Mese con 2 cifre (es. 02 per febbraio)
      day: '2-digit',    // Giorno con 2 cifre (es. 15)
    });
  } catch (error) {
    // In caso di errore durante la formattazione, logga l'errore nella console
    console.error('Error formatting date:', error);
    // Restituisce la stringa originale non formattata come fallback
    return dateString;
  }
}

/**
 * Formatta un numero come valuta in Euro (EUR) nel formato italiano.
 * @param amount - L'importo numerico da formattare
 * @returns La stringa formattata come valuta (es. "€ 1.234,56")
 */
export function formatCurrency(amount: number): string {
  // Utilizza l'API Intl.NumberFormat per formattare il numero come valuta EUR nel locale italiano
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',   // Stile di formattazione: valuta
    currency: 'EUR',     // Codice della valuta: Euro
  }).format(amount);     // Applica la formattazione all'importo
}

/**
 * Capitalizza la prima lettera di una stringa, rendendo le restanti minuscole.
 * @param str - La stringa da capitalizzare
 * @returns La stringa con la prima lettera maiuscola e il resto minuscolo
 */
export function capitalize(str: string): string {
  // Se la stringa è vuota o falsy, restituisce una stringa vuota
  if (!str) return '';
  // Prende il primo carattere e lo converte in maiuscolo, poi concatena il resto della stringa in minuscolo
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Tronca un testo aggiungendo i puntini di sospensione se supera la lunghezza massima.
 * @param text - Il testo da troncare
 * @param length - La lunghezza massima consentita (default: 50 caratteri)
 * @returns Il testo troncato con '...' se necessario, altrimenti il testo originale
 */
export function truncate(text: string, length: number = 50): string {
  // Se il testo è più corto o uguale alla lunghezza massima, lo restituisce invariato
  if (text.length <= length) return text;
  // Altrimenti taglia il testo alla lunghezza specificata e aggiunge i puntini di sospensione
  return text.substring(0, length) + '...';
}
