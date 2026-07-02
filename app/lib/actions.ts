'use server';

import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import Attivita from '@/models/Attivita';
import Esercizio from '@/models/Esercizio';
import Logopedista from '@/models/Logopedista';
import Paziente from '@/models/Paziente';

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

function externalIdFromUnknown(value: unknown): number {
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

  return 0;
}

function sameObjectId(a: unknown, b: unknown): boolean {
  if (!a || !b) return false;
  return a.toString() === b.toString();
}

function normalizeImages(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input.map((v) => String(v)).filter(Boolean);
  }

  if (typeof input === 'string') {
    return input
      .split('|')
      .map((v) => v.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizePathologies(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input.map((v) => String(v).trim()).filter(Boolean);
  }

  if (typeof input === 'string') {
    return input
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }

  return [];
}

async function getLogopedistaByPIva(pIva: string) {
  return Logopedista.findOne({ pIva }).select('_id pIva preferiti').lean();
}

async function resolveActivityByExternalId(activityId: number, scope: any = {}) {
  const byCod = await Attivita.findOne({ ...scope, cod: activityId })
    .select('_id cod creatore id_logopedista')
    .lean();

  if (byCod) return byCod;

  const candidates = await Attivita.find(scope)
    .select('_id cod creatore id_logopedista')
    .lean();

  return (
    candidates.find((activity: any) => {
      const currentId = externalIdFromUnknown(activity.cod ?? activity._id);
      return currentId === activityId;
    }) || null
  );
}

async function resolveExerciseByExternalId(exerciseId: number, scope: any = {}) {
  const byLegacyId = await Esercizio.findOne({ ...scope, id: exerciseId })
    .select('_id id')
    .lean();

  if (byLegacyId) return byLegacyId;

  const candidates = await Esercizio.find(scope).select('_id id').lean();

  return (
    candidates.find((exercise: any) => {
      const currentId = externalIdFromUnknown(exercise.id ?? exercise._id);
      return currentId === exerciseId;
    }) || null
  );
}

async function findOwnedCommentByExternalId(commentId: number, logopedistaId: unknown) {
  const activities = await Attivita.find({ 'commenti.logopedista': logopedistaId })
    .select('_id cod commenti')
    .lean();

  for (const activity of activities as any[]) {
    const comments = Array.isArray(activity.commenti) ? activity.commenti : [];

    for (const comment of comments) {
      const currentId = externalIdFromUnknown(comment.cod ?? comment._id);
      if (currentId !== commentId) continue;
      if (!sameObjectId(comment.logopedista, logopedistaId)) continue;

      return {
        activityObjectId: activity._id,
        activityExternalId: externalIdFromUnknown(activity.cod ?? activity._id),
        commentObjectId: comment._id,
      };
    }
  }

  return null;
}

export async function toggleFavorite(activityId: number, isFavorite: boolean) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: 'Utente non autenticato' };

  try {
    await connectToDatabase();

    const logopedista = await getLogopedistaByPIva(userId);
    if (!logopedista) return { success: false, error: 'Logopedista non trovato' };

    const activity = await resolveActivityByExternalId(activityId);
    if (!activity?._id) return { success: false, error: 'Attivita non trovata' };

    if (isFavorite) {
      await Logopedista.updateOne(
        { _id: logopedista._id },
        { $addToSet: { preferiti: { attivita: activity._id } } }
      );
    } else {
      await Logopedista.updateOne(
        { _id: logopedista._id },
        { $pull: { preferiti: { attivita: activity._id } } }
      );
    }

    revalidatePath('/logopedista/imieimateriali');
    return { success: true };
  } catch (error) {
    console.error('Errore aggiornamento preferiti:', error);
    return { success: false, error: 'Impossibile aggiornare i preferiti' };
  }
}

export async function saveActivity(formData: any) {
  const userId = await getUserId();
  if (!userId) return { success: false, message: 'Devi essere loggato per salvare' };

  try {
    await connectToDatabase();

    const logopedista = await getLogopedistaByPIva(userId);
    if (!logopedista) return { success: false, message: 'Utente non valido' };

    const {
      titolo,
      descrizione,
      immagine,
      obbiettivo,
      fasciaEta,
      patologie,
      accessibilita,
    } = formData;

    await Attivita.create({
      titolo,
      descrizione,
      istruzioni: obbiettivo,
      immagini: normalizeImages(immagine),
      accessibilita: Boolean(accessibilita),
      fasciaEta: Number(fasciaEta || 0),
      patologie: normalizePathologies(patologie),
      creatore: logopedista._id,
      dataCreazione: new Date(),
    });

    revalidatePath('/logopedista/imieimateriali');
    return { success: true, message: 'Attivita salvata!' };
  } catch (error) {
    console.error('Errore salvataggio attivita:', error);
    return { success: false, message: 'Errore nel salvataggio' };
  }
}

export async function assignPatientToLogopedist(cf: string, pIva: string) {
  try {
    await connectToDatabase();

    const logopedista = await getLogopedistaByPIva(pIva);
    if (!logopedista) return { success: false, error: 'Logopedista non trovato' };

    const result = await Paziente.updateOne({ cf }, { $set: { logopedista: logopedista._id } });
    if (result.matchedCount === 0) {
      return { success: false, error: 'Paziente non trovato' };
    }

    revalidatePath('/logopedista/lista-pazienti/accoppiamento-paziente');
    revalidatePath('/logopedista/lista-pazienti');
    return { success: true };
  } catch (error) {
    console.error('Errore assegnazione paziente:', error);
    return { success: false, error: "Errore nell'assegnazione del paziente" };
  }
}

export async function unassignPatient(cf: string) {
  try {
    await connectToDatabase();

    const result = await Paziente.updateOne({ cf }, { $set: { logopedista: null } });
    if (result.matchedCount === 0) {
      return { success: false, error: 'Paziente non trovato' };
    }

    revalidatePath('/logopedista/lista-pazienti');
    revalidatePath(`/logopedista/lista-pazienti/dettaglio-paziente/${cf}`);
    return { success: true };
  } catch (error) {
    console.error('Errore disaccoppiamento paziente:', error);
    return { success: false, error: 'Errore nel disaccoppiamento del paziente' };
  }
}

export async function assignExerciseToPatient(patientCf: string, activityId: number) {
  const userId = await getUserId();
  if (!userId) return { success: false, message: 'Utente non loggato' };

  try {
    await connectToDatabase();

    const [logopedista, patient] = await Promise.all([
      getLogopedistaByPIva(userId),
      Paziente.findOne({ cf: patientCf }).select('_id').lean(),
    ]);

    if (!logopedista || !patient) {
      return { success: false, message: 'Dati utente non validi' };
    }

    const activity = await resolveActivityByExternalId(activityId);
    if (!activity?._id) {
      return { success: false, message: 'Attivita non trovata' };
    }

    const duplicate = await Esercizio.findOne({
      paziente: patient._id,
      attivita: activity._id,
      logopedista: logopedista._id,
    })
      .select('_id')
      .lean();

    if (duplicate) {
      return { success: false, message: 'Questo esercizio e gia assegnato.' };
    }

    await Esercizio.create({
      dataAssegnazione: new Date(),
      statoCompletamento: 'da-svolgere',
      esito: '',
      attivita: activity._id,
      logopedista: logopedista._id,
      paziente: patient._id,
    });

    revalidatePath('/logopedista/lista-pazienti');
    revalidatePath(`/logopedista/lista-pazienti/dettaglio-paziente/${patientCf}`);
    return { success: true, message: 'Esercizio assegnato con successo!' };
  } catch (error) {
    console.error('Errore assegnazione esercizio:', error);
    return { success: false, message: "Errore durante l'assegnazione." };
  }
}

export async function deleteActivity(id: number) {
  const userId = await getUserId();
  if (!userId) return { success: false, message: 'Non autorizzato' };

  try {
    await connectToDatabase();

    const logopedista = await getLogopedistaByPIva(userId);
    if (!logopedista) return { success: false, message: 'Non autorizzato' };

    const activity = await resolveActivityByExternalId(id, {
      $or: [{ creatore: logopedista._id }, { id_logopedista: userId }],
    });

    if (!activity?._id) {
      return { success: false, message: 'Non puoi eliminare questa attivita o non esiste.' };
    }

    await Attivita.deleteOne({ _id: activity._id });
    revalidatePath('/logopedista/imieimateriali');
  } catch (error) {
    console.error('Errore eliminazione:', error);
    return { success: false, message: "Errore durante l'eliminazione" };
  }

  redirect('/logopedista/imieimateriali');
}

export async function updateActivity(id: number, formData: any) {
  const userId = await getUserId();
  if (!userId) return { success: false, message: 'Non autorizzato' };

  try {
    await connectToDatabase();

    const logopedista = await getLogopedistaByPIva(userId);
    if (!logopedista) return { success: false, message: 'Non autorizzato' };

    const activity = await resolveActivityByExternalId(id, {
      $or: [{ creatore: logopedista._id }, { id_logopedista: userId }],
    });

    if (!activity?._id) {
      return { success: false, message: 'Attivita non trovata o non autorizzata' };
    }

    const {
      titolo,
      descrizione,
      immagine,
      obbiettivo,
      fasciaEta,
      patologie,
      accessibilita,
    } = formData;

    await Attivita.updateOne(
      { _id: activity._id },
      {
        $set: {
          titolo,
          descrizione,
          istruzioni: obbiettivo,
          immagini: normalizeImages(immagine),
          fasciaEta: Number(fasciaEta || 0),
          patologie: normalizePathologies(patologie),
          accessibilita: Boolean(accessibilita),
        },
      }
    );

    revalidatePath(`/logopedista/imieimateriali/${id}`);
    revalidatePath('/logopedista/imieimateriali');
    return { success: true, message: 'Attivita aggiornata!' };
  } catch (error) {
    console.error('Errore aggiornamento attivita:', error);
    return { success: false, message: "Errore durante l'aggiornamento" };
  }
}

export async function removeAssignedExercise(exerciseId: number, patientCf: string) {
  try {
    await connectToDatabase();

    const patient = await Paziente.findOne({ cf: patientCf }).select('_id').lean();

    const scope: any = {};
    if (patient?._id) {
      scope.$or = [{ paziente: patient._id }, { id_paziente: patientCf }];
    } else {
      scope.id_paziente = patientCf;
    }

    const exercise = await resolveExerciseByExternalId(exerciseId, scope);
    if (!exercise?._id) {
      return { success: false, message: 'Esercizio non trovato.' };
    }

    await Esercizio.deleteOne({ _id: exercise._id });
    revalidatePath(`/logopedista/lista-pazienti/dettaglio-paziente/${patientCf}`);
    return { success: true, message: 'Attivita rimossa dal paziente.' };
  } catch (error) {
    console.error('Errore rimozione esercizio:', error);
    return { success: false, message: 'Errore durante la rimozione.' };
  }
}

export async function addComment(activityId: number, message: string) {
  const userId = await getUserId();
  if (!userId) return { success: false, message: 'Non sei loggato' };

  try {
    await connectToDatabase();

    const logopedista = await getLogopedistaByPIva(userId);
    if (!logopedista) return { success: false, message: 'Utente non valido' };

    const activity = await resolveActivityByExternalId(activityId);
    if (!activity?._id) return { success: false, message: 'Attivita non trovata' };

    await Attivita.updateOne(
      { _id: activity._id },
      {
        $push: {
          commenti: {
            messaggio: message,
            data: new Date(),
            logopedista: logopedista._id,
          },
        },
      }
    );

    revalidatePath(`/logopedista/ricerca-materiali/${activityId}`);
    revalidatePath(`/logopedista/imieimateriali/${activityId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Errore DB' };
  }
}

export async function editComment(commentId: number, newMessage: string) {
  const userId = await getUserId();
  if (!userId) return { success: false, message: 'Non sei loggato' };

  try {
    await connectToDatabase();

    const logopedista = await getLogopedistaByPIva(userId);
    if (!logopedista) return { success: false, message: 'Utente non valido' };

    const owner = await findOwnedCommentByExternalId(commentId, logopedista._id);
    if (!owner) return { success: false, message: 'Non autorizzato o commento non trovato' };

    await Attivita.updateOne(
      {
        _id: owner.activityObjectId,
        'commenti._id': owner.commentObjectId,
        'commenti.logopedista': logopedista._id,
      },
      {
        $set: {
          'commenti.$.messaggio': newMessage,
          'commenti.$.data': new Date(),
        },
      }
    );

    revalidatePath(`/logopedista/ricerca-materiali/${owner.activityExternalId}`);
    revalidatePath(`/logopedista/imieimateriali/${owner.activityExternalId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Errore modifica' };
  }
}

export async function deleteComment(commentId: number) {
  const userId = await getUserId();
  if (!userId) return { success: false, message: 'Non sei loggato' };

  try {
    await connectToDatabase();

    const logopedista = await getLogopedistaByPIva(userId);
    if (!logopedista) return { success: false, message: 'Utente non valido' };

    const owner = await findOwnedCommentByExternalId(commentId, logopedista._id);
    if (!owner) return { success: false, message: 'Non autorizzato o commento non trovato' };

    await Attivita.updateOne(
      { _id: owner.activityObjectId },
      {
        $pull: {
          commenti: {
            _id: owner.commentObjectId,
            logopedista: logopedista._id,
          },
        },
      }
    );

    revalidatePath(`/logopedista/ricerca-materiali/${owner.activityExternalId}`);
    revalidatePath(`/logopedista/imieimateriali/${owner.activityExternalId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Errore eliminazione' };
  }
}
