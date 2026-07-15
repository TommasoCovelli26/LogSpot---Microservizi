// Importa la funzione notFound per mostrare la pagina 404
import { notFound } from 'next/navigation';
// Importa il componente Link per la navigazione client-side
import Link from 'next/link';
// Importa la funzione cookies per accedere ai cookie HTTP lato server
import { cookies } from 'next/headers';
// Importa le icone utilizzate nella pagina da Heroicons
import {
  ArrowLeftIcon,        // Icona freccia indietro per la navigazione
  UserCircleIcon,       // Icona profilo utente per il creatore
  DocumentTextIcon,     // Icona documento per la sezione descrizione
  PencilSquareIcon,     // Icona matita per il pulsante assegna
  SparklesIcon          // Icona stelline per il badge "Attività Community"
} from '@heroicons/react/24/outline';
// Importa le funzioni per recuperare attività e commenti dal database
import { fetchActivityById, fetchCommentsByActivityId } from '../../../lib/activities';
// Importa il componente della sezione commenti
import CommentSection from '../../../ui/logopedista/comment-section';
// Importa il font personalizzato Lusitana
import { lusitana } from '../../../ui/fonts';
// Importa il componente per visualizzare le immagini dell'attività
import DetailImageViewer from '../../../ui/logopedista/detail-image-viewer';

/**
 * Pagina di dettaglio di un'attività pubblica.
 * Componente Server che mostra la descrizione, le immagini, l'obiettivo,
 * le patologie, il creatore, i commenti e il pulsante per assegnare l'attività.
 * Corrisponde alla route '/logopedista/ricerca-materiali/[id]'.
 */
export default async function PublicActivityDetailPage({
  params
}: {
  params: Promise<{ id: string }>  // Parametri dinamici dell'URL (id dell'attività)
}) {
  // Estrae l'id dell'attività dai parametri dinamici della route
  const { id } = await params;
  // Converte l'id in numero intero (necessario per i commenti)
  const activityId = parseInt(id);
  // Recupera i dettagli dell'attività dal database tramite il suo ID
  const activity = await fetchActivityById(id);

  // Se l'attività non esiste o non è pubblica, mostra la pagina 404
  if (!activity || !activity.accessibilita) {
    notFound();
  }

  // Costruisce il nome completo del creatore dell'attività dai dati del DB
  // Se il nome non è disponibile, usa un fallback generico
  const creatorName = activity.nome_logopedista 
    ? `${activity.nome_logopedista} ${activity.cognome_logopedista}`
    : 'Utente LogSpot';

  // Recupera i commenti associati a questa attività
  const comments = await fetchCommentsByActivityId(activityId);
  // Recupera i cookie HTTP per identificare l'utente corrente
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('utente');
  // Parsing dei dati utente dal cookie (oggetto vuoto come fallback)
  const userData = userCookie ? JSON.parse(userCookie.value) : {};
  // Estrae la P.IVA dell'utente corrente (per i commenti)
  const currentPiva = userData.utente?.pIva || userData.utente?.PIva || userData.utente?.codice || '';

  // Splitta la stringa delle patologie in un array (separate da virgola)
  const patologieList = activity.patologie ? activity.patologie.split(',') : [];
  // Splitta la stringa delle immagini in un array (separate da pipe '|')
  const allegatiList = activity.immagine ? activity.immagine.split('|') : [];

  return (
    // Container principale: sfondo bianco, padding responsivo
    <main className="w-full min-h-screen bg-white p-6 md:p-12 font-sans">
      {/* HEADER: navigazione e titolo dell'attività */}
      <div className="max-w-5xl mx-auto mb-8">
        {/* Link per tornare alla pagina di ricerca materiali */}
        <Link
          href="/logopedista/ricerca-materiali"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition mb-6 font-medium uppercase text-sm tracking-wider"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Torna alla ricerca
        </Link>

        {/* Barra del titolo con badge "Attività Community" */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
          {/* Titolo dell'attività con font Lusitana */}
          <h1 className={`${lusitana.className} text-4xl md:text-5xl font-bold text-yellow-400`}>
            {activity.titolo}
          </h1>

          {/* Badge che indica che si tratta di un'attività pubblica dalla community */}
          <span
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border bg-blue-50 text-blue-700 border-blue-200"
          >
            <SparklesIcon className="w-4 h-4" />
            Attività Community
          </span>
        </div>
      </div>

      {/* Layout a griglia: colonna contenuto (2/3) + colonna laterale info (1/3) */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLONNA SINISTRA: descrizione e obiettivo terapeutico */}
        <div className="lg:col-span-2 space-y-8">
          {/* Card descrizione con barra decorativa gialla laterale */}
          <div className="bg-white rounded-4xl p-8 border-2 border-gray-100 shadow-sm relative overflow-hidden">
            {/* Barra decorativa verticale gialla */}
            <div className="absolute top-0 left-0 w-2 h-full bg-yellow-400"></div>
            {/* Titolo sezione: Descrizione */}
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5" /> Descrizione
            </h3>

            {/* Testo della descrizione con supporto newline */}
            <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
              {activity.descrizione || 'Nessuna descrizione inserita per questa attività.'}
            </p>

            {/* Viewer per le immagini allegate all'attività */}
            <DetailImageViewer images={allegatiList} />
          </div>

          {/* Card obiettivo terapeutico con sfondo celeste */}
          <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
            {/* Titolo sezione: Obiettivo Terapeutico */}
            <h3 className="text-sm font-bold text-blue-300 uppercase tracking-widest mb-4">
              Obiettivo Terapeutico
            </h3>
            {/* Testo dell'obiettivo in stile corsivo */}
            <p className="text-blue-900 font-medium text-xl italic leading-relaxed">
              "{activity.istruzioni || 'Nessun obiettivo specificato.'}"
            </p>
          </div>
        </div>

        {/* COLONNA DESTRA: età target, patologie, creatore e pulsante assegna */}
        <div className="space-y-6">
          {/* Card Target Età con barra di progresso visiva */}
          <div className="bg-yellow-50 p-6 rounded-2xl border-2 border-yellow-400 shadow-sm">
            <h3 className="text-xs font-bold text-yellow-700 uppercase tracking-widest mb-2">Target Età</h3>
            {/* Valore della fascia d'età in formato grande */}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-5xl font-black text-yellow-900 tracking-tight">{activity.fasciaEta}</span>
              <span className="text-yellow-700 font-bold uppercase text-sm">anni</span>
            </div>
            {/* Barra di progresso visiva proporzionale all'età */}
            <div className="w-full bg-white h-3 rounded-full overflow-hidden relative border border-yellow-200">
              <div
                className="h-full bg-yellow-400 rounded-full relative"
                style={{ width: `${Math.min((activity.fasciaEta / 123) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Card Patologie associate all'attività */}
          <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-200 shadow-sm">
            <h3 className="text-xs font-bold text-yellow-700 uppercase tracking-widest mb-4">Patologie</h3>
            {/* Lista di badge per ogni patologia */}
            <div className="flex flex-wrap gap-2">
              {patologieList.length > 0 ? (
                patologieList.map((pat, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-white text-yellow-800 rounded-lg text-xs font-bold uppercase border border-yellow-200 tracking-wide shadow-sm"
                  >
                    {pat}
                  </span>
                ))
              ) : (
                // Messaggio quando non ci sono patologie specificate
                <span className="text-yellow-600 text-sm italic">Nessun tag specificato.</span>
              )}
            </div>
          </div>

          {/* Card informazioni sul creatore dell'attività */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 mt-8">
            {/* Icona avatar del creatore */}
            <div className="bg-white p-2 rounded-full shadow-sm border border-gray-100">
              <UserCircleIcon className="w-8 h-8 text-gray-300" />
            </div>
            <div>
              {/* Etichetta "Creato da" */}
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Creato da</p>
              {/* Nome del creatore recuperato dal database */}
              <p className="text-sm font-bold text-gray-800">{creatorName}</p>
            </div>
          </div>

          {/* Pulsante per navigare alla pagina di assegnazione dell'attività a un paziente */}
          <Link
            href={`/logopedista/ricerca-materiali/${id}/assegna`}
            className="flex items-center justify-center gap-2 px-4 py-4 border border-green-500 bg-green-50 text-black rounded-xl font-bold uppercase text-xs hover:bg-green-600 transition shadow-md tracking-wider w-full"
          >
            <PencilSquareIcon className="w-4 h-4" />
            Assegna al paziente
          </Link>
        </div>
      </div>

      {/* SEZIONE COMMENTI: area commenti interattiva per l'attività pubblica */}
      <div className="max-w-5xl mx-auto mt-12 pb-12">
        {/* Componente CommentSection: gestisce visualizzazione e invio commenti */}
        {/* isPublic=true permette a tutti i logopedisti di commentare */}
        <CommentSection 
          activityId={activityId} 
          comments={comments} 
          currentUserPiva={currentPiva} 
          isPublic={true}
        />
      </div>

    </main>
  );
}