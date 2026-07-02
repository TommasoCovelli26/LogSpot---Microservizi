import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Attivita from '@/models/Attivita';
import Esercizio from '@/models/Esercizio';
import Logopedista from '@/models/Logopedista';
import Paziente from '@/models/Paziente';

// Interfaccia TypeScript che rappresenta un'attività con il suo stato di preferito
export interface ActivityWithFavorite {
  cod: number;             // Codice univoco dell'attività (chiave primaria)
  titolo: string;          // Titolo dell'attività
  dataCreazione: string;   // Data di creazione dell'attività
  isFavorite: boolean;     // Indica se l'attività è tra i preferiti del logopedista corrente
}

// Interfaccia TypeScript che rappresenta un esercizio assegnato a un paziente
export interface AssignedExercise {
  id: number;                          // ID univoco dell'esercizio assegnato
  titolo: string;                      // Titolo dell'attività associata all'esercizio
  dataAssegnazione: string;            // Data in cui l'esercizio è stato assegnato al paziente
  statoCompletamento: string | null;   // Stato di completamento: 'da-svolgere', 'in-corso', 'completato' o null
  esito: string | null;               // Esito dell'esercizio (può essere null se non ancora completato)
  id_attivita: number;                // ID dell'attività collegata a questo esercizio
}

// Interfaccia TypeScript che rappresenta un commento su un'attività
export interface Comment {
  cod: number;                     // Codice univoco del commento (chiave primaria)
  messaggio: string;               // Testo del commento
  data: string;                    // Data e ora di creazione del commento
  id_logopedista: string;          // P.IVA del logopedista che ha scritto il commento
  nome_logopedista: string;        // Nome del logopedista autore del commento
  cognome_logopedista: string;     // Cognome del logopedista autore del commento
}

// Interfaccia TypeScript che rappresenta il dettaglio completo di un'attività
export interface ActivityDetail {
  cod: number;                         // Codice univoco dell'attività
  titolo: string;                      // Titolo dell'attività
  descrizione: string;                 // Descrizione testuale dell'attività
  istruzioni: string;                  // Istruzioni / obiettivo dell'attività
  immagine: string;                    // URL o percorso dell'immagine associata (stringhe separate da "|" se multiple)
  accessibilita: boolean;              // Se true, l'attività è pubblica e visibile a tutti i logopedisti
  fasciaEta: number;                   // Fascia d'età consigliata per l'attività
  patologie: string;                   // Patologie target, separate da virgola
  id_logopedista: string;              // P.IVA del logopedista che ha creato l'attività
  // Campi opzionali per il nome del creatore dell'attività (popolati tramite JOIN)
  nome_logopedista?: string;           // Nome del logopedista creatore (opzionale)
  cognome_logopedista?: string;        // Cognome del logopedista creatore (opzionale)
}

type ActivityMongo = {
  _id: unknown;
  cod?: number;
  titolo?: string;
  dataCreazione?: Date | string | null;
  descrizione?: string;
  istruzioni?: string;
  immagini?: string[];
  immagine?: string;
  accessibilita?: boolean | number;
  fasciaEta?: number;
  patologie?: string[] | string;
  creatore?: {
    pIva?: string;
    nome?: string;
    cognome?: string;
  } | null;
  id_logopedista?: string;
  commenti?: CommentMongo[];
};

type ExerciseMongo = {
  _id: unknown;
  id?: number;
  dataAssegnazione?: Date | string | null;
  statoCompletamento?: string | null;
  esito?: string | null;
  id_attivita?: number;
  attivita?: {
    _id?: unknown;
    cod?: number;
    titolo?: string;
  } | null;
};

type CommentMongo = {
  _id?: unknown;
  cod?: number;
  messaggio?: string;
  data?: Date | string | null;
  logopedista?: {
    pIva?: string;
    nome?: string;
    cognome?: string;
  } | null;
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toDateString(value: Date | string | null | undefined): string {
  if (!value) return new Date().toISOString();
  if (typeof value === 'string') return value;
  return value.toISOString();
}

function toNumericId(value: unknown, fallback: number = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) return parsed;
    if (mongoose.isValidObjectId(value)) {
      return Number.parseInt(value.slice(-8), 16);
    }
  }
  if (value instanceof mongoose.Types.ObjectId) {
    return Number.parseInt(value.toString().slice(-8), 16);
  }
  return fallback;
}

function normalizePatologie(value: string[] | string | undefined): string {
  if (!value) return '';
  return Array.isArray(value) ? value.join(',') : value;
}

function normalizeImmagine(value: string[] | string | undefined): string {
  if (!value) return '';
  return Array.isArray(value) ? value.join('|') : value;
}

function getFavoriteSet(logopedista: any): Set<string> {
  const ids = (logopedista?.preferiti || [])
    .map((p: any) => p?.attivita)
    .filter(Boolean)
    .map((id: any) => id.toString());
  return new Set(ids);
}

function buildIdQuery(id: string): any[] {
  const clauses: any[] = [];
  if (mongoose.isValidObjectId(id)) {
    clauses.push({ _id: new mongoose.Types.ObjectId(id) });
  }

  const numericId = Number.parseInt(id, 10);
  if (Number.isFinite(numericId)) {
    clauses.push({ cod: numericId });
  }
  return clauses;
}

/**
 * Recupera le attività create da un logopedista specifico, con supporto per ricerca e filtri.
 * @param userId - La P.IVA del logopedista di cui recuperare le attività
 * @param query - Termine di ricerca opzionale per filtrare per titolo
 * @param filter - Tipo di filtro: 'recenti' (default) o 'preferiti'
 * @returns Un array di attività con informazione sui preferiti, ordinate per data di creazione decrescente
 */
export async function fetchActivities(
  userId: string, 
  query: string = '', 
  filter: string = 'recenti'
): Promise<ActivityWithFavorite[]> {
  try {
    await connectToDatabase();

    const logopedista = await Logopedista.findOne({ pIva: userId })
      .select('_id preferiti')
      .lean();

    if (!logopedista) return [];

    const conditions: any[] = [{
      $or: [{ creatore: logopedista._id }, { id_logopedista: userId }],
    }];

    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      conditions.push({ titolo: { $regex: escapeRegex(trimmedQuery), $options: 'i' } });
    }

    const mongoQuery = conditions.length === 1 ? conditions[0] : { $and: conditions };
    const favoriteSet = getFavoriteSet(logopedista);

    const activities = await Attivita.find(mongoQuery)
      .select('cod titolo dataCreazione')
      .sort({ dataCreazione: -1 })
      .lean<ActivityMongo[]>();

    const mapped = activities.map((activity) => {
      const activityId = activity._id?.toString?.() || '';
      return {
        cod: toNumericId(activity.cod ?? activity._id),
        titolo: activity.titolo || '',
        dataCreazione: toDateString(activity.dataCreazione),
        isFavorite: favoriteSet.has(activityId),
      };
    });

    return filter === 'preferiti' ? mapped.filter((a) => a.isFavorite) : mapped;
  } catch (error) {
    // Logga l'errore e lancia un'eccezione con un messaggio leggibile
    console.error('Database Error:', error);
    throw new Error('Impossibile recuperare le attività.');
  }
}

/**
 * Recupera le attività pubbliche (accessibilità = 1) con supporto per ricerca, filtri, età e patologie.
 * @param userId - La P.IVA del logopedista corrente (per verificare i preferiti)
 * @param query - Termine di ricerca opzionale per filtrare per titolo
 * @param filter - Tipo di filtro: 'recenti' (default) o 'preferiti'
 * @param age - Fascia d'età opzionale per filtrare le attività adatte
 * @param pathologies - Array opzionale di patologie per filtrare le attività pertinenti
 * @returns Un array di attività pubbliche con informazione sui preferiti
 */
export async function fetchPublicActivities(
  userId: string,
  query: string = '',
  filter: string = 'recenti',
  age?: number,
  pathologies?: string[]
): Promise<ActivityWithFavorite[]> {
  try {
    await connectToDatabase();

    const logopedista = await Logopedista.findOne({ pIva: userId })
      .select('_id preferiti')
      .lean();

    const favoriteSet = getFavoriteSet(logopedista);
    const conditions: any[] = [{
      $or: [{ accessibilita: true }, { accessibilita: 1 }],
    }];

    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      conditions.push({ titolo: { $regex: escapeRegex(trimmedQuery), $options: 'i' } });
    }

    if (age && age > 0) {
      conditions.push({ fasciaEta: { $lte: age } });
    }

    if (pathologies && pathologies.length > 0) {
      const pathologyClauses = pathologies
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => ({
          $or: [
            { patologie: { $regex: escapeRegex(p), $options: 'i' } },
            { patologie: { $elemMatch: { $regex: escapeRegex(p), $options: 'i' } } },
          ],
        }));

      if (pathologyClauses.length > 0) {
        conditions.push({ $or: pathologyClauses });
      }
    }

    const mongoQuery = conditions.length === 1 ? conditions[0] : { $and: conditions };

    const activities = await Attivita.find(mongoQuery)
      .select('cod titolo dataCreazione')
      .sort({ dataCreazione: -1 })
      .lean<ActivityMongo[]>();

    const mapped = activities.map((activity) => {
      const activityId = activity._id?.toString?.() || '';
      return {
        cod: toNumericId(activity.cod ?? activity._id),
        titolo: activity.titolo || '',
        dataCreazione: toDateString(activity.dataCreazione),
        isFavorite: favoriteSet.has(activityId),
      };
    });

    return filter === 'preferiti' ? mapped.filter((a) => a.isFavorite) : mapped;
  } catch (error) {
    // Logga l'errore e lancia un'eccezione con messaggio leggibile
    console.error('Database Error:', error);
    throw new Error('Impossibile recuperare le attività pubbliche.');
  }
}

/**
 * Recupera il dettaglio completo di un'attività specifica tramite il suo ID,
 * includendo anche il nome e cognome del logopedista creatore tramite JOIN.
 * @param id - L'ID (cod) dell'attività da recuperare
 * @returns L'oggetto ActivityDetail con tutti i dettagli, oppure null se non trovata
 */
export async function fetchActivityById(id: string): Promise<ActivityDetail | null> {
  try {
    await connectToDatabase();

    const idClauses = buildIdQuery(id);

    let activity = null as ActivityMongo | null;

    if (idClauses.length > 0) {
      activity = await Attivita.findOne({ $or: idClauses })
        .populate({ path: 'creatore', select: 'pIva nome cognome' })
        .lean<ActivityMongo | null>();
    }

    // Fallback: se la query diretta non ha prodotto clausole utili (ad es. id non numerico
    // e non ObjectId) oppure non ha trovato nulla, proviamo a cercare per external numeric id
    // scansionando i candidati e confrontando con toNumericId
    if (!activity) {
      const candidates = await Attivita.find({})
        .select('_id cod creatore id_logopedista immagini immagine fasciaEta patologie titolo descrizione istruzioni accessibilita dataCreazione')
        .populate({ path: 'creatore', select: 'pIva nome cognome' })
        .lean<ActivityMongo[]>();

      const numericId = Number.parseInt(id, 10);
      if (Number.isFinite(numericId)) {
        activity = candidates.find((candidate) => toNumericId(candidate.cod ?? candidate._id) === numericId) || null;
      }
    }

    if (!activity) return null;

    const creator = activity.creatore || null;

    return {
      cod: toNumericId(activity.cod ?? activity._id),
      titolo: activity.titolo || '',
      descrizione: activity.descrizione || '',
      istruzioni: activity.istruzioni || '',
      immagine: normalizeImmagine(activity.immagini ?? activity.immagine),
      accessibilita: Boolean(activity.accessibilita),
      fasciaEta: Number(activity.fasciaEta || 0),
      patologie: normalizePatologie(activity.patologie),
      id_logopedista: creator?.pIva || activity.id_logopedista || '',
      nome_logopedista: creator?.nome,
      cognome_logopedista: creator?.cognome,
    };
  } catch (error) {
    // Logga l'errore e restituisce null in caso di problemi
    console.error('Database Error:', error);
    return null;
  }
}

/**
 * Recupera gli esercizi assegnati a un paziente specifico, con supporto per ricerca e filtri.
 * @param patientCf - Il codice fiscale del paziente di cui recuperare gli esercizi
 * @param query - Termine di ricerca opzionale per filtrare per titolo
 * @param filter - Tipo di filtro: 'tutti' (default), 'completati' o 'in-corso'
 * @returns Un array di esercizi assegnati ordinati per data di assegnazione decrescente
 */
export async function fetchAssignedExercises(
  patientCf: string,
  query: string = '',
  filter: string = 'tutti'
): Promise<AssignedExercise[]> {
  try {
    await connectToDatabase();

    const patient = await Paziente.findOne({ cf: patientCf }).select('_id').lean();
    const patientConditions: any[] = [{ id_paziente: patientCf }];

    if (patient?._id) {
      patientConditions.push({ paziente: patient._id });
    }

    const conditions: any[] = [{ $or: patientConditions }];

    if (filter === 'completati') {
      conditions.push({ statoCompletamento: 'completato' });
    } else if (filter === 'in-corso') {
      conditions.push({
        $or: [{ statoCompletamento: null }, { statoCompletamento: 'in-corso' }],
      });
    }

    const mongoQuery = conditions.length === 1 ? conditions[0] : { $and: conditions };

    const exercises = await Esercizio.find(mongoQuery)
      .populate({ path: 'attivita', select: 'titolo cod _id' })
      .sort({ dataAssegnazione: -1 })
      .lean<ExerciseMongo[]>();

    let mapped = exercises.map((exercise) => {
      const activity = exercise.attivita || null;
      return {
        id: toNumericId(exercise.id ?? exercise._id),
        titolo: activity?.titolo || '',
        dataAssegnazione: toDateString(exercise.dataAssegnazione),
        statoCompletamento: exercise.statoCompletamento ?? null,
        esito: exercise.esito ?? null,
        id_attivita: toNumericId(exercise.id_attivita ?? activity?.cod ?? activity?._id),
      };
    });

    const trimmedQuery = query.trim().toLowerCase();
    if (trimmedQuery) {
      mapped = mapped.filter((exercise) => exercise.titolo.toLowerCase().includes(trimmedQuery));
    }

    return mapped;
  } catch (error) {
    // Logga l'errore e lancia un'eccezione con messaggio leggibile
    console.error('Database Error:', error);
    throw new Error('Impossibile recuperare gli esercizi assegnati.');
  }
}

/**
 * Recupera tutti i commenti associati a un'attività specifica,
 * includendo nome e cognome del logopedista autore di ciascun commento.
 * @param activityId - L'ID dell'attività di cui recuperare i commenti
 * @returns Un array di commenti ordinati per data decrescente, o un array vuoto in caso di errore
 */
export async function fetchCommentsByActivityId(activityId: number): Promise<Comment[]> {
  try {
    await connectToDatabase();

    let activity = await Attivita.findOne({ cod: activityId })
      .select('_id cod commenti')
      .populate({ path: 'commenti.logopedista', select: 'pIva nome cognome' })
      .lean<ActivityMongo | null>();

    if (!activity) {
      const candidates = await Attivita.find({})
        .select('_id cod commenti')
        .populate({ path: 'commenti.logopedista', select: 'pIva nome cognome' })
        .lean<ActivityMongo[]>();

      activity =
        candidates.find((candidate) => toNumericId(candidate.cod ?? candidate._id) === activityId) || null;
    }

    if (!activity?.commenti || activity.commenti.length === 0) {
      return [];
    }

    return [...activity.commenti]
      .sort((a, b) => new Date(toDateString(b.data)).getTime() - new Date(toDateString(a.data)).getTime())
      .map((comment) => ({
        cod: toNumericId(comment.cod ?? comment._id),
        messaggio: comment.messaggio || '',
        data: toDateString(comment.data),
        id_logopedista: comment.logopedista?.pIva || '',
        nome_logopedista: comment.logopedista?.nome || 'Utente',
        cognome_logopedista: comment.logopedista?.cognome || '',
      }));
  } catch (error) {
    // Logga l'errore e restituisce un array vuoto come fallback sicuro
    console.error('Errore fetch commenti:', error);
    return [];
  }
}