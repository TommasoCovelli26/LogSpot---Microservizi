// Direttiva 'use server': indica a Next.js che questo modulo contiene funzioni eseguibili solo lato server
'use server';

import connectToDatabase from '@/lib/mongodb';
import Paziente from '@/models/Paziente';
import Logopedista from '@/models/Logopedista';

// Interfaccia TypeScript che definisce la struttura di un oggetto Paziente
export interface Patient {
  cf: string;                    // Codice fiscale del paziente (chiave primaria)
  nome: string;                  // Nome del paziente
  cognome: string;               // Cognome del paziente
  email: string;                 // Indirizzo email del paziente
  numTelefono: string | null;    // Numero di telefono (opzionale, può essere null)
  dataNascita: string | null;    // Data di nascita (opzionale, può essere null)
}

type PatientMongo = {
  cf: string;
  nome: string;
  cognome: string;
  email: string;
  numTelefono?: string | null;
  dataNascita?: Date | string | null;
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeDate(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value.toISOString();
}

function mapPatient(patient: PatientMongo): Patient {
  return {
    cf: patient.cf,
    nome: patient.nome,
    cognome: patient.cognome,
    email: patient.email,
    numTelefono: patient.numTelefono ?? null,
    dataNascita: normalizeDate(patient.dataNascita),
  };
}

/**
 * Recupera la lista dei pazienti assegnati a un determinato logopedista.
 * @param pIva - La Partita IVA del logopedista di cui recuperare i pazienti
 * @param query - Termine di ricerca opzionale per filtrare per nome o cognome
 * @returns Un array di oggetti Patient ordinati per cognome e nome in ordine ascendente
 */
export async function fetchPatients(pIva: string, query?: string): Promise<Patient[]> {
  try {
    await connectToDatabase();

    const logopedista = await Logopedista.findOne({ pIva }).select('_id').lean();
    if (!logopedista) return [];

    const trimmedQuery = query?.trim();
    const filters: any = { logopedista: logopedista._id };

    if (trimmedQuery) {
      const regex = new RegExp(escapeRegex(trimmedQuery), 'i');
      filters.$or = [{ nome: regex }, { cognome: regex }];
    }

    const patients = await Paziente.find(filters)
      .select('cf nome cognome email numTelefono dataNascita -_id')
      .sort({ cognome: 1, nome: 1 })
      .lean<PatientMongo[]>();

    return patients.map(mapPatient);
  } catch (error) {
    // Logga l'errore nella console in caso di problemi con il database
    console.error('Error fetching patients:', error);
    // Rilancia l'errore per gestirlo nel chiamante
    throw error;
  }
}

/**
 * Recupera un singolo paziente cercandolo per codice fiscale.
 * @param cf - Il codice fiscale del paziente da cercare
 * @returns L'oggetto Patient trovato, oppure null se non esiste
 */
export async function fetchPatientsByCf(cf: string): Promise<Patient | null> {
  try {
    await connectToDatabase();

    const patient = await Paziente.findOne({ cf })
      .select('cf nome cognome email numTelefono dataNascita -_id')
      .lean<PatientMongo | null>();

    return patient ? mapPatient(patient) : null;
  } catch (error) {
    // Logga l'errore nella console in caso di problemi
    console.error('Error fetching patient:', error);
    // Rilancia l'errore per gestirlo nel chiamante
    throw error;
  }
}

/**
 * Recupera tutti i pazienti non ancora assegnati a nessun logopedista.
 * @param query - Termine di ricerca opzionale per filtrare per CF, nome o cognome
 * @returns Un array di pazienti non assegnati, ordinati per cognome e nome
 */
export async function fetchUnassignedPatients(query?: string): Promise<Patient[]> {
  try {
    await connectToDatabase();

    const conditions: any[] = [
      { $or: [{ logopedista: null }, { logopedista: { $exists: false } }] },
    ];

    const trimmedQuery = query?.trim();
    if (trimmedQuery) {
      const regex = new RegExp(escapeRegex(trimmedQuery), 'i');
      conditions.push({
        $or: [{ cf: regex }, { nome: regex }, { cognome: regex }],
      });
    }

    const mongoQuery = conditions.length === 1 ? conditions[0] : { $and: conditions };

    const patients = await Paziente.find(mongoQuery)
      .select('cf nome cognome email numTelefono dataNascita -_id')
      .sort({ cognome: 1, nome: 1 })
      .lean<PatientMongo[]>();

    return patients.map(mapPatient);
  } catch (error) {
    // Logga l'errore nella console in caso di problemi
    console.error('Error fetching unassigned patients:', error);
    // Rilancia l'errore per gestirlo nel chiamante
    throw error;
  }
}
