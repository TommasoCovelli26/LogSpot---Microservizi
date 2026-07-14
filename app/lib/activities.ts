'use server';

import { apiGet } from '../../lib/http/client';
import { SERVICES } from '../../lib/config/services';

export interface ActivityWithFavorite {
  cod: number;
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
  id_attivita: string | number;
}

export interface Comment {
  cod: number;
  messaggio: string;
  data: string;
  id_logopedista: string;
  nome_logopedista: string;
  cognome_logopedista: string;
}

export interface ActivityDetail {
  cod: number;
  titolo: string;
  descrizione: string;
  istruzioni: string;
  immagine: string;
  accessibilita: boolean;
  fasciaEta: number;
  patologie: string;
  id_logopedista: string;
  nome_logopedista?: string;
  cognome_logopedista?: string;
}

export async function fetchActivities(userId: string, query: string = '', filter: string = 'recenti'): Promise<ActivityWithFavorite[]> {
  try {
    // 1. Recupera tutte le attività e i preferiti dal Gateway
    const [activities, preferiti] = await Promise.all([
      apiGet<any[]>(`${SERVICES.CATALOG}`),
      apiGet<any[]>(`${SERVICES.USER}/logopedista/${userId}/preferiti`).catch(() => [])
    ]);

    const preferitiIds = new Set(preferiti.map((p: any) => p.attivitaId || p.id));

    // 2. Mappa e filtra per utente
    let mapped = activities
      .filter(a => a.creatore === userId || a.id_logopedista === userId)
      .map(a => ({
        cod: Number(a.id || a.cod),
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
    const [activities, preferiti] = await Promise.all([
      apiGet<any[]>(`${SERVICES.CATALOG}/accessibilita/true`),
      apiGet<any[]>(`${SERVICES.USER}/logopedista/${userId}/preferiti`).catch(() => [])
    ]);

    const preferitiIds = new Set(preferiti.map((p: any) => p.attivitaId || p.id));

    let mapped = activities.map(a => ({
      cod: Number(a.id || a.cod),
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
      mapped = mapped.filter(a => 
        pathologies.some(p => a.patologie?.toLowerCase().includes(p.toLowerCase()))
      );
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
    return {
      cod: Number(data.id || data.cod),
      titolo: data.titolo || '',
      descrizione: data.descrizione || '',
      istruzioni: data.istruzioni || '',
      immagine: Array.isArray(data.immagini) ? data.immagini.join('|') : (data.immagine || ''),
      accessibilita: Boolean(data.accessibilita),
      fasciaEta: Number(data.fasciaEta || 0),
      patologie: Array.isArray(data.patologie) ? data.patologie.join(',') : (data.patologie || ''),
      id_logopedista: data.creatore || data.id_logopedista || '',
      nome_logopedista: data.nome_logopedista,
      cognome_logopedista: data.cognome_logopedista,
    };
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
}

export async function fetchAssignedExercises(patientCf: string, query: string = '', filter: string = 'tutti'): Promise<AssignedExercise[]> {
  try {
    const exercises = await apiGet<any[]>(`${SERVICES.THERAPY}/pazienti/${patientCf}/esercizi`);
    
    let mapped = exercises.map(e => ({
      id: e.id,
      titolo: e.titolo || 'Esercizio',
      dataAssegnazione: e.dataAssegnazione,
      statoCompletamento: e.statoCompletamento,
      esito: e.esito,
      id_attivita: e.attivita || e.attivitaId || e.id_attivita
    }));

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
    throw new Error('Impossibile recuperare gli esercizi assegnati.');
  }
}

export async function fetchCommentsByActivityId(activityId: number): Promise<Comment[]> {
  try {
    const comments = await apiGet<any[]>(`${SERVICES.CATALOG}/${activityId}/commenti`);
    return comments.map(c => ({
      cod: c.id || c.cod,
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