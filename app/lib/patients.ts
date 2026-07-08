'use server';

import { apiGet } from '../../lib/http/client';
import { SERVICES } from '../../lib/config/services';

export interface Patient {
  cf: string;
  nome: string;
  cognome: string;
  email: string;
  numTelefono: string | null;
  dataNascita: string | null;
}

export async function fetchPatients(pIva: string, query?: string): Promise<Patient[]> {
  try {
    let patients = await apiGet<Patient[]>(`${SERVICES.USER}/logopedista/${pIva}/pazienti`);
    
    // Filtraggio lato frontend (se il backend non gestisce la query)
    const trimmedQuery = query?.trim().toLowerCase();
    if (trimmedQuery) {
      patients = patients.filter(p => 
        p.nome.toLowerCase().includes(trimmedQuery) || 
        p.cognome.toLowerCase().includes(trimmedQuery)
      );
    }
    
    return patients;
  } catch (error) {
    console.error('Error fetching patients via API:', error);
    throw error;
  }
}

export async function fetchPatientsByCf(cf: string): Promise<Patient | null> {
  try {
    return await apiGet<Patient>(`${SERVICES.USER}/paziente/${cf}`);
  } catch (error) {
    console.error('Error fetching patient via API:', error);
    return null;
  }
}

export async function fetchUnassignedPatients(query?: string): Promise<Patient[]> {
  try {
    // NOTA: Assicurati di creare un endpoint GET /users/pazienti/unassigned nello user-service
    // Se non lo hai ancora fatto, questa chiamata fallirà in 404 finché non la aggiungi a UserController.java
    let patients = await apiGet<Patient[]>(`${SERVICES.USER}/pazienti/unassigned`);
    
    const trimmedQuery = query?.trim().toLowerCase();
    if (trimmedQuery) {
      patients = patients.filter(p => 
        p.cf.toLowerCase().includes(trimmedQuery) ||
        p.nome.toLowerCase().includes(trimmedQuery) || 
        p.cognome.toLowerCase().includes(trimmedQuery)
      );
    }
    return patients;
  } catch (error) {
    console.error('Error fetching unassigned patients:', error);
    return [];
  }
}