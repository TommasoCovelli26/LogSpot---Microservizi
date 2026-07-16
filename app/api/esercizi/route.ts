import { NextResponse } from 'next/server';
import { apiGet } from '../../../lib/http/client';
import { SERVICES } from '../../../lib/config/services';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cf = searchParams.get('cf');
  const pIva = searchParams.get('pIva');
  // Parametri usati nella vista paziente
  const query = searchParams.get('query') || '';
  const filter = searchParams.get('filter') || 'tutti';

  // Modalità 1: Vista Logopedista (recupera gli esercizi assegnati da un logopedista specifico a un paziente)
  if (cf && pIva) {
    try {
      const esercizi = await apiGet<any[]>(`${SERVICES.THERAPY}/pazienti/${cf}/esercizi`);

      // Filtriamo lato frontend per assicurarci che siano quelli assegnati da questo specifico logopedista
      const filtered = esercizi
        .filter(e => (e.logopedista || e.logopedistaId || e.id_logopedista) === pIva);

      // Arricchisce ogni esercizio col titolo reale recuperato dal catalog-service
      const mapped = await Promise.all(
        filtered.map(async (exercise) => {
          const activityId = exercise.attivita || exercise.attivitaId || exercise.id_attivita;
          let activityDetails: any = {};
          if (activityId) {
            activityDetails = await apiGet<any>(`${SERVICES.CATALOG}/${activityId}`).catch(() => ({}));
          }
          return {
            id: exercise.id,
            titolo: activityDetails.titolo || 'Esercizio',
            dataAssegnazione: exercise.dataAssegnazione || new Date().toISOString(),
            statoCompletamento: exercise.statoCompletamento ?? null,
            esito: exercise.esito ?? null,
          };
        })
      );

      return NextResponse.json(mapped);
    } catch (error) {
      console.error('API Error:', error);
      return NextResponse.json(
        { error: 'Errore nel recupero degli esercizi del logopedista' },
        { status: 500 }
      );
    }
  }

  // Modalità 2: Vista Paziente (recupera tutti gli esercizi del paziente con filtri)
  if (cf) {
    try {
      const esercizi = await apiGet<any[]>(`${SERVICES.THERAPY}/pazienti/${cf}/esercizi`);

      let mapped = await Promise.all(
        esercizi.map(async (e) => {
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
            id_attivita: activityId
          };
        })
      );

      // Applica i filtri di ricerca testuale
      const trimmedQuery = query.trim().toLowerCase();
      if (trimmedQuery) {
        mapped = mapped.filter(e => e.titolo.toLowerCase().includes(trimmedQuery));
      }

      // Applica i filtri di stato
      if (filter === 'completati') {
        mapped = mapped.filter(e => e.statoCompletamento === 'COMPLETATO');
      } else if (filter === 'in-corso') {
        mapped = mapped.filter(e => e.statoCompletamento !== 'COMPLETATO');
      }

      return NextResponse.json(mapped);
    } catch (error) {
      console.error('API Error:', error);
      return NextResponse.json(
        { error: 'Errore nel recupero degli esercizi del paziente' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { error: 'Parametri mancanti' },
    { status: 400 }
  );
}