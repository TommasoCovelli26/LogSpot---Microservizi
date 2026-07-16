'use server';

import { apiGet } from '../../lib/http/client';
import { SERVICES } from '../../lib/config/services';

export interface ActivityWithFavorite {
  id: string;
  titolo: string;
  dataCreazione: string;
  isFavorite: boolean;
}

export interface AssignedExercise {
  id: number;
  titolo: string;
  dataAssegnazione: string;
  statoCompletamento: string | null;
  esito: string | null;
  durata: number;
  id_attivita: string | number;
}

export interface Comment {
  id: string;
  messaggio: string;
  data: string;
  id_logopedista: string;
  nome_logopedista: string;
  cognome_logopedista: string;
}

export interface ActivityDetail {
  id: string;
  titolo: string;
  descrizione: string;
  istruzioni: string;
  immagine: string;
  immagini?: string[];
  accessibilita: boolean;
  fasciaEta: number;
  patologie: string;
  id_logopedista: string;
  nome_logopedista?: string;
  cognome_logopedista?: string;
}

async function fetchCreatorName(creatorId: string): Promise<{ nome_logopedista?: string; cognome_logopedista?: string }> {
  if (!creatorId) {
    return {};
  }

  try {
    const user = await apiGet<any>(`${SERVICES.USER}/logopedista/${creatorId}`);
    return {
      nome_logopedista: user?.nome,
      cognome_logopedista: user?.cognome,
    };
  } catch {
    return {};
  }
}

export async function fetchActivities(userId: string, query: string = '', filter: string = 'recenti'): Promise<ActivityWithFavorite[]> {
  try {
    // 1. Recupera tutte le attività e i preferiti dal Gateway
    const [activities, preferiti] = await Promise.all([
      apiGet<any[]>(`${SERVICES.CATALOG}`),
      apiGet<any[]>(`${SERVICES.USER}/logopedista/${userId}/preferiti`).catch(() => [])
    ]);


        // MAPPA ANTIPROIETTILE
    const preferitiIds = new Set(preferiti.map((p: any) => {
      // Se p è un oggetto, cerchiamo il campo che contiene l'ID. 
      // Nel tuo Java, il campo si chiama "attivita" (visto in removePreferito)
      const idTrovato = p.attivita || p.attivitaId || p.idAttivita || p.id || p._id;
      
      return String(idTrovato);
    }));

    // 2. Mappa e filtra per utente
    let mapped = activities
      .filter(a => a.creatore === userId || a.id_logopedista === userId)
      .map(a => ({
        id: String(a.id),
        titolo: a.titolo,
        dataCreazione: a.dataCreazione || new Date().toISOString(),
        isFavorite: preferitiIds.has(String(a.id || a.cod))
      }));

    if (query.trim()) {
      mapped = mapped.filter(a => a.titolo.toLowerCase().includes(query.toLowerCase()));
    }

    return filter === 'preferiti' ? mapped.filter(a => a.isFavorite) : mapped;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Impossibile recuperare le attività dal microservizio.');
  }
}

export async function fetchPublicActivities(userId: string, query: string = '', filter: string = 'recenti', age?: number, pathologies?: string[]): Promise<ActivityWithFavorite[]> {
  try {
    const activities = await apiGet<any[]>(`${SERVICES.CATALOG}/accessibilita/true`);
    const preferiti = userId
      ? await apiGet<any[]>(`${SERVICES.USER}/logopedista/${userId}/preferiti`).catch(() => [])
      : [];


        // MAPPA ANTIPROIETTILE
    const preferitiIds = new Set(preferiti.map((p: any) => {
      // Se p è un oggetto, cerchiamo il campo che contiene l'ID. 
      // Nel tuo Java, il campo si chiama "attivita" (visto in removePreferito)
      const idTrovato = p.attivita || p.attivitaId || p.idAttivita || p.id || p._id;
      
      return String(idTrovato);
    }));

    let mapped = activities.map(a => ({
      id: String(a.id),
      titolo: a.titolo,
      dataCreazione: a.dataCreazione || new Date().toISOString(),
      isFavorite: preferitiIds.has(String(a.id || a.cod)),
      fasciaEta: a.fasciaEta,
      patologie: a.patologie,
      id_logopedista: a.creatore || a.id_logopedista || ''
    }));

    if (query.trim()) {
      mapped = mapped.filter(a => a.titolo.toLowerCase().includes(query.toLowerCase()));
    }
    if (age && age > 0) {
      mapped = mapped.filter(a => a.fasciaEta <= age);
    }
    if (pathologies && pathologies.length > 0) {
      mapped = mapped.filter(a => {
        const itemPathologies = Array.isArray(a.patologie)
          ? a.patologie.join(' ').toLowerCase()
          : String(a.patologie || '').toLowerCase();

        return pathologies.some((p) => itemPathologies.includes(p.toLowerCase()));
      });
    }

    return filter === 'preferiti' ? mapped.filter(a => a.isFavorite) : mapped;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Impossibile recuperare le attività pubbliche.');
  }
}

export async function fetchActivityById(id: string): Promise<ActivityDetail | null> {
  try {
    const data = await apiGet<any>(`${SERVICES.CATALOG}/${id}`);
    const creatorId = String(data.creatore || data.id_logopedista || '').trim();
    const creatorName = await fetchCreatorName(creatorId);

    return {
      id: String(data.id),
      titolo: data.titolo || '',
      descrizione: data.descrizione || '',
      istruzioni: data.istruzioni || '',
      immagine: Array.isArray(data.immagini) ? data.immagini.join('|') : (data.immagine || ''),
      immagini: Array.isArray(data.immagini) ? data.immagini : (data.immagine ? String(data.immagine).split('|').filter(Boolean) : []),
      accessibilita: Boolean(data.accessibilita),
      fasciaEta: Number(data.fasciaEta || 0),
      patologie: Array.isArray(data.patologie) ? data.patologie.join(',') : (data.patologie || ''),
      id_logopedista: creatorId,
      nome_logopedista: creatorName.nome_logopedista || data.nome_logopedista,
      cognome_logopedista: creatorName.cognome_logopedista || data.cognome_logopedista,
    };
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
}

export async function fetchAssignedExercises(patientCf: string, query: string = '', filter: string = 'tutti'): Promise<AssignedExercise[]> {
  try {
    const exercises = await apiGet<any[]>(`${SERVICES.THERAPY}/pazienti/${patientCf}/esercizi`);

    // Recupera in parallelo i dettagli di ogni attività collegata dal catalog-service
    let mapped: AssignedExercise[] = await Promise.all(
      exercises.map(async (e) => {
        const activityId = e.attivita || e.attivitaId || e.id_attivita;
        let activityDetails: any = {};

        if (activityId) {
          activityDetails = await apiGet<any>(`${SERVICES.CATALOG}/${activityId}`).catch(() => ({}));
        }

        return {
          id: e.id,
          titolo: activityDetails.titolo || 'Esercizio',
          dataAssegnazione: e.dataAssegnazione,
          statoCompletamento: e.statoCompletamento,
          esito: e.esito,
          durata: e.durata || 0,
          id_attivita: activityId,
        };
      })
    );

    if (query.trim()) {
      mapped = mapped.filter(e => e.titolo.toLowerCase().includes(query.toLowerCase()));
    }
    if (filter === 'completati') {
      mapped = mapped.filter(e => e.statoCompletamento === 'completato');
    } else if (filter === 'in-corso') {
      mapped = mapped.filter(e => !e.statoCompletamento || e.statoCompletamento === 'in-corso');
    }

    return mapped;
  } catch (error) {
    console.error('API Error:', error);
    return [];
  }
}

export async function fetchCommentsByActivityId(activityId: string): Promise<Comment[]> {
  try {
    const comments = await apiGet<any[]>(`${SERVICES.CATALOG}/${activityId}/commenti`);
    return comments.map(c => ({
      id: String(c.id),
      messaggio: c.messaggio,
      data: c.data,
      id_logopedista: c.logopedistaId || c.id_logopedista,
      nome_logopedista: c.nome_logopedista || 'Utente',
      cognome_logopedista: c.cognome_logopedista || '',
    }));
  } catch (error) {
    console.error('Errore fetch commenti API:', error);
    return [];
  }
}