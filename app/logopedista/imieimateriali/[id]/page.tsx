// Importa le funzioni notFound e redirect da Next.js per gestire pagine 404 e reindirizzamenti
import { notFound, redirect } from 'next/navigation';
// Importa il componente Link di Next.js per la navigazione client-side
import Link from 'next/link';
// Importa la funzione cookies per accedere ai cookie HTTP lato server
import { cookies } from 'next/headers';
// Importa le icone Heroicons utilizzate nell'interfaccia
import { 
  ArrowLeftIcon,        // Freccia indietro per navigazione
  UserCircleIcon,       // Icona utente per il creatore
  DocumentTextIcon,     // Icona documento per la descrizione
  PencilSquareIcon,     // Icona matita per il pulsante modifica
  UserPlusIcon          // Icona utente+ per il pulsante assegna
} from '@heroicons/react/24/outline';
// Importa le funzioni per recuperare attività e commenti dal database
import { fetchActivityById, fetchCommentsByActivityId } from '../../../lib/activities';
// Importa il componente per la sezione commenti
import CommentSection from '../../../ui/logopedista/comment-section';
// Importa il font personalizzato Lusitana
import { lusitana } from '../../../ui/fonts';
// Importa il componente pulsante per eliminare un'attività
import DeleteActivityButton from '../../../ui/logopedista/delete-button';
// Importa il componente per visualizzare le immagini allegati in dettaglio
import DetailImageViewer from '../../../ui/logopedista/detail-image-viewer';

/**
 * Pagina di dettaglio di un'attività del logopedista.
 * Mostra tutte le informazioni dell'attività: titolo, descrizione con allegati,
 * obiettivo terapeutico, fascia d'età, patologie, stato pubblico/privato,
 * info creatore e sezione commenti.
 * Offre azioni: modifica, assegna al paziente, elimina.
 * Corrisponde alla route '/logopedista/imieimateriali/[id]'.
 */
export default async function ActivityDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }>  // Parametri dinamici dell'URL (id dell'attività)
}) {
  // Estrae l'id dell'attività dai parametri dinamici della route
  const { id } = await params;
  // Converte l'id in numero per le funzioni che richiedono un intero
  const activityId = parseInt(id);
  // Recupera i dettagli completi dell'attività dal database
  const activity = await fetchActivityById(id);

  // Se l'attività non esiste nel database, mostra la pagina 404
  if (!activity) {
    notFound();
  }

  // --- RECUPERO UTENTE DAI COOKIE ---
  // Accede allo store dei cookie per identificare il logopedista corrente
  const cookieStore = await cookies();
  // Legge il cookie 'utente' contenente i dati della sessione
  const userCookie = cookieStore.get('utente');
  // Nome del creatore dell'attività (fallback in caso di cookie mancante)
  let creatorName = "Utente Sconosciuto";
  // P.IVA del logopedista corrente (per la sezione commenti)
  let currentPiva = '';

  // Se il cookie esiste, estrae nome/cognome e P.IVA dell'utente
  if (userCookie) {
    try {
      // Parsing del valore JSON del cookie
      const userData = JSON.parse(userCookie.value);
      if (userData?.utente) {
        // Compone il nome completo del creatore da nome e cognome
        creatorName = `${userData.utente.nome} ${userData.utente.cognome}`;
        // Salva la P.IVA per la sezione commenti
        currentPiva = userData.utente.pIva || userData.utente.PIva || userData.utente.codice;
      }
    } catch (e) {
      // Logga l'errore se il cookie non è parsabile
      console.error("Errore parsing cookie utente", e);
    }
  }
  // -------------------------------------

  // Recupera tutti i commenti associati a questa attività
  const comments = await fetchCommentsByActivityId(activityId);

  // Splitta la stringa delle patologie (separata da virgola) in un array
  const patologieList = activity.patologie ? activity.patologie.split(',') : [];
  // Splitta la stringa delle immagini (separata da '|') in un array
  const allegatiList = activity.immagine ? activity.immagine.split('|') : [];

  return (
    // Container principale: sfondo bianco, padding responsivo
    <main className="w-full min-h-screen bg-white p-6 md:p-12 font-sans">
      
      {/* HEADER: breadcrumb e titolo dell'attività */}
      <div className="max-w-5xl mx-auto mb-8">
        {/* Link per tornare alla lista dei materiali */}
        <Link 
          href="/logopedista/imieimateriali"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition mb-6 font-medium uppercase text-sm tracking-wider"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Torna ai materiali
        </Link>

        {/* Riga con titolo dell'attività e pulsanti azione */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
            {/* Titolo dell'attività con font Lusitana e colore giallo */}
            <h1 className={`${lusitana.className} text-4xl md:text-5xl font-bold text-yellow-500`}>
              {activity.titolo}
            </h1>
            
            {/* Pulsanti azione: Modifica e badge Pubblica/Privata */}
            <div className="flex items-center gap-3">
                {/* Pulsante per andare alla pagina di modifica dell'attività */}
                <Link 
                    href={`/logopedista/imieimateriali/${id}/modifica`}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black rounded-full font-bold uppercase text-xs hover:bg-yellow-500 transition shadow-md tracking-wider"
                >
                    <PencilSquareIcon className="w-4 h-4" />
                    Modifica
                </Link>

                {/* Badge stato accessibilità: verde se pubblica, grigio se privata */}
                <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border ${
                    activity.accessibilita 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-gray-50 text-gray-500 border-gray-200'
                }`}>
                    {activity.accessibilita ? 'Pubblica' : 'Privata'}
                </span>
            </div>
        </div>
      </div>

      {/* CONTENUTO PRINCIPALE: griglia a 3 colonne su desktop */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNA SINISTRA (2/3 dello spazio): descrizione e obiettivo */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* Card Descrizione: bordo sinistro giallo, contenuto dell'attività */}
            <div className="bg-white rounded-[2rem] p-8 border-2 border-gray-100 shadow-sm relative overflow-hidden">
                {/* Barra decorativa gialla sul lato sinistro */}
                <div className="absolute top-0 left-0 w-2 h-full bg-yellow-400"></div>
                
                {/* Titolo sezione Descrizione con icona documento */}
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <DocumentTextIcon className="w-5 h-5" /> Descrizione
                </h3>
                
                {/* Testo descrittivo dell'attività (preserva i ritorni a capo) */}
                <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                    {activity.descrizione || "Nessuna descrizione inserita per questa attività."}
                </p>

                {/* Componente per visualizzare le immagini allegati */}
                <DetailImageViewer images={allegatiList} />
            </div>

            {/* Card Obiettivo Terapeutico: sfondo azzurro, testo in corsivo */}
            <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
                {/* Titolo sezione Obiettivo */}
                <h3 className="text-sm font-bold text-blue-300 uppercase tracking-widest mb-4">
                    Obiettivo Terapeutico
                </h3>
                {/* Testo obiettivo tra virgolette, in corsivo */}
                <p className="text-blue-900 font-medium text-xl italic leading-relaxed">
                    "{activity.istruzioni || 'Nessun obiettivo specificato.'}"
                </p>
            </div>

        </div>

        {/* COLONNA DESTRA (1/3 dello spazio): info, età, patologie, azioni */}
        <div className="space-y-6">
            
            {/* Card Target Età: mostra la fascia d'età con barra di progresso */}
            <div className="bg-yellow-50 p-6 rounded-2xl border-2 border-yellow-400 shadow-sm">
                {/* Titolo sezione Età */}
                <h3 className="text-xs font-bold text-yellow-700 uppercase tracking-widest mb-2">Target Età</h3>
                {/* Numero grande dell'età + unità */}
                <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-5xl font-black text-yellow-900 tracking-tight">{activity.fasciaEta}</span>
                    <span className="text-yellow-700 font-bold uppercase text-sm">anni</span>
                </div>
                
                {/* Barra di progresso visuale per la fascia d'età */}
                <div className="w-full bg-white h-3 rounded-full overflow-hidden relative border border-yellow-200">
                    {/* Barra di riempimento gialla proporzionale all'età (max 123 anni) */}
                    <div 
                        className="h-full bg-yellow-400 rounded-full relative" 
                        style={{ width: `${Math.min((activity.fasciaEta / 123) * 100, 100)}%` }}
                    ></div>
                </div>
            </div>

            {/* Card Patologie: lista dei tag delle patologie associate */}
            <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-200 shadow-sm">
                {/* Titolo sezione Patologie */}
                <h3 className="text-xs font-bold text-yellow-700 uppercase tracking-widest mb-4">Patologie</h3>
                {/* Container flex-wrap per i tag delle patologie */}
                <div className="flex flex-wrap gap-2">
                    {/* Se ci sono patologie, le mostra come badge; altrimenti mostra un messaggio */}
                    {patologieList.length > 0 ? (
                        patologieList.map((pat, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-white text-yellow-800 rounded-lg text-xs font-bold uppercase border border-yellow-200 tracking-wide shadow-sm">
                                {pat}
                            </span>
                        ))
                    ) : (
                        <span className="text-yellow-600 text-sm italic">Nessun tag specificato.</span>
                    )}
                </div>
            </div>

            {/* Card Info Creatore: mostra il nome del logopedista che ha creato l'attività */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 mt-8">
                {/* Icona avatar utente */}
                <div className="bg-white p-2 rounded-full shadow-sm border border-gray-100">
                    <UserCircleIcon className="w-8 h-8 text-gray-300" />
                </div>
                <div>
                    {/* Label "Creato da" */}
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Creato da</p>
                    {/* Nome dinamico del creatore recuperato dai cookie */}
                    <p className="text-sm font-bold text-gray-800">{creatorName}</p>
                </div>
            </div>

            {/* Pulsante Assegna: link alla pagina di assegnazione dell'attività a un paziente */}
            <Link
                href={`/logopedista/imieimateriali/${id}/assegna`}
                className="flex items-center justify-center gap-2 px-4 py-4 border-2 border-green-200 bg-green-100 text-black rounded-xl font-bold uppercase text-xs hover:bg-green-500 transition shadow-md tracking-wider w-full mt-4"
            >
                <UserPlusIcon className="w-4 h-4" />
                Assegna al paziente
            </Link>

            {/* Pulsante Elimina: componente client per eliminare l'attività */}
            <DeleteActivityButton id={activity.cod} />

        </div>
        
      </div>

      {/* SEZIONE COMMENTI: discussione sull'attività */}
      <div className="max-w-5xl mx-auto mt-12 pb-12">
        {/* Componente CommentSection: mostra i commenti e il form per aggiungerne di nuovi */}
        {/* isPublic determina se il form di inserimento commenti è visibile (solo per attività pubbliche) */}
        <CommentSection 
          activityId={activityId} 
          comments={comments} 
          currentUserPiva={currentPiva} 
          isPublic={activity.accessibilita} 
        />
      </div>
      
    </main>
  );
}