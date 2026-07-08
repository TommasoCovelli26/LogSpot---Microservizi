'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { apiPost, apiPut, apiDelete } from '../../lib/http/client';
import { SERVICES } from '../../lib/config/services';

async function getUserId() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('utente');
  if (!userCookie) return null;
  try {
    const userData = JSON.parse(userCookie.value);
    return userData.utente?.pIva || null;
  } catch {
    return null;
  }
}

function normalizeImages(input: unknown): string[] {
  if (Array.isArray(input)) return input.map((v) => String(v)).filter(Boolean);
  if (typeof input === 'string') return input.split('|').map((v) => v.trim()).filter(Boolean);
  return [];
}

function normalizePathologies(input: unknown): string[] {
  if (Array.isArray(input)) return input.map((v) => String(v).trim()).filter(Boolean);
  if (typeof input === 'string') return input.split(',').map((v) => v.trim()).filter(Boolean);
  return [];
}

export async function toggleFavorite(activityId: number, isFavorite: boolean) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: 'Utente non autenticato' };

  try {
    if (isFavorite) {
      await apiPost(`${SERVICES.USER}/logopedista/${userId}/preferiti/${activityId}`, {});
    } else {
      await apiDelete(`${SERVICES.USER}/logopedista/${userId}/preferiti/${activityId}`);
    }
    revalidatePath('/logopedista/imieimateriali');
    return { success: true };
  } catch (error) {
    console.error('Errore API preferiti:', error);
    return { success: false, error: 'Impossibile aggiornare i preferiti' };
  }
}

export async function saveActivity(formData: any) {
  const userId = await getUserId();
  if (!userId) return { success: false, message: 'Devi essere loggato per salvare' };

  try {
    await apiPost(`${SERVICES.CATALOG}`, {
      titolo: formData.titolo,
      descrizione: formData.descrizione,
      istruzioni: formData.obbiettivo,
      immagini: normalizeImages(formData.immagine),
      accessibilita: Boolean(formData.accessibilita),
      fasciaEta: Number(formData.fasciaEta || 0),
      patologie: normalizePathologies(formData.patologie),
      id_logopedista: userId
    });

    revalidatePath('/logopedista/imieimateriali');
    return { success: true, message: 'Attivita salvata!' };
  } catch (error) {
    console.error('Errore API salvataggio attivita:', error);
    return { success: false, message: 'Errore nel salvataggio' };
  }
}

export async function assignPatientToLogopedist(cf: string, pIva: string) {
  try {
    await apiPut(`${SERVICES.USER}/paziente/${cf}/logopedista`, { logopedistaId: pIva });
    revalidatePath('/logopedista/lista-pazienti/accoppiamento-paziente');
    revalidatePath('/logopedista/lista-pazienti');
    return { success: true };
  } catch (error) {
    return { success: false, error: "Errore nell'assegnazione del paziente tramite API" };
  }
}

export async function unassignPatient(cf: string) {
  try {
    await apiDelete(`${SERVICES.USER}/paziente/${cf}/logopedista`);
    revalidatePath('/logopedista/lista-pazienti');
    revalidatePath(`/logopedista/lista-pazienti/dettaglio-paziente/${cf}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Errore nel disaccoppiamento del paziente via API' };
  }
}

export async function assignExerciseToPatient(patientCf: string, activityId: number) {
  const userId = await getUserId();
  if (!userId) return { success: false, message: 'Utente non loggato' };

  try {
    await apiPost(`${SERVICES.THERAPY}/esercizi`, {
      pazienteId: patientCf,
      attivitaId: activityId.toString(),
      logopedistaId: userId
    });

    revalidatePath('/logopedista/lista-pazienti');
    revalidatePath(`/logopedista/lista-pazienti/dettaglio-paziente/${patientCf}`);
    return { success: true, message: 'Esercizio assegnato con successo!' };
  } catch (error) {
    return { success: false, message: "Errore durante l'assegnazione via API." };
  }
}

export async function deleteActivity(id: number) {
  try {
    await apiDelete(`${SERVICES.CATALOG}/${id}`);
    revalidatePath('/logopedista/imieimateriali');
  } catch (error) {
    return { success: false, message: "Errore API durante l'eliminazione" };
  }
  redirect('/logopedista/imieimateriali');
}

export async function updateActivity(id: number, formData: any) {
  try {
    await apiPut(`${SERVICES.CATALOG}/${id}`, {
      titolo: formData.titolo,
      descrizione: formData.descrizione,
      istruzioni: formData.obbiettivo,
      immagini: normalizeImages(formData.immagine),
      fasciaEta: Number(formData.fasciaEta || 0),
      patologie: normalizePathologies(formData.patologie),
      accessibilita: Boolean(formData.accessibilita),
    });

    revalidatePath(`/logopedista/imieimateriali/${id}`);
    revalidatePath('/logopedista/imieimateriali');
    return { success: true, message: 'Attivita aggiornata!' };
  } catch (error) {
    return { success: false, message: "Errore API durante l'aggiornamento" };
  }
}

export async function removeAssignedExercise(exerciseId: number, patientCf: string) {
  try {
    await apiDelete(`${SERVICES.THERAPY}/esercizi/${exerciseId}`);
    revalidatePath(`/logopedista/lista-pazienti/dettaglio-paziente/${patientCf}`);
    return { success: true, message: 'Attivita rimossa dal paziente.' };
  } catch (error) {
    return { success: false, message: 'Errore API durante la rimozione.' };
  }
}

export async function addComment(activityId: number, message: string) {
  const userId = await getUserId();
  if (!userId) return { success: false, message: 'Non sei loggato' };

  try {
    await apiPost(`${SERVICES.CATALOG}/${activityId}/commenti`, {
      messaggio: message,
      logopedistaId: userId
    });
    revalidatePath(`/logopedista/ricerca-materiali/${activityId}`);
    revalidatePath(`/logopedista/imieimateriali/${activityId}`);
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Errore API aggiunta commento' };
  }
}

export async function editComment(commentId: number, newMessage: string) {
  // Nota: questa funzione richiederà nel backend la ricerca dell'id attività tramite commento o la sua inclusione.
  // Supponendo che il gateway permetta l'update diretto (modifica se l'endpoint è diverso)
  try {
    await apiPut(`${SERVICES.CATALOG}/commenti/${commentId}`, { messaggio: newMessage });
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Errore API modifica commento' };
  }
}

export async function deleteComment(commentId: number) {
  // Come per l'edit, dipende da come è mappato l'endpoint nel backend.
  try {
    await apiDelete(`${SERVICES.CATALOG}/commenti/${commentId}`);
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Errore API eliminazione commento' };
  }
}

export async function deletePatient(id: string) {
  try {
    await apiDelete(`${SERVICES.USER}/paziente/${id}`);
    revalidatePath('/logopedista/lista-pazienti');
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Errore API eliminazione paziente' };
  }
}