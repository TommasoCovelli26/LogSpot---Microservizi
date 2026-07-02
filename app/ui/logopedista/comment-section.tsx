// Direttiva Next.js: indica che questo è un componente client-side
'use client';

// Importa l'hook useState per lo stato locale
import { useState } from 'react';
// Importa l'hook useRouter per la navigazione e il refresh dei dati
import { useRouter } from 'next/navigation';
// Importa le icone Heroicons utilizzate nella sezione commenti
import { 
  UserCircleIcon,        // Icona avatar per l'utente
  PaperAirplaneIcon,     // Icona invio per il pulsante di submit
  PencilSquareIcon,      // Icona modifica per il pulsante di edit
  TrashIcon,             // Icona cestino per il pulsante di eliminazione
  CheckIcon              // Icona check per confermare la modifica
} from '@heroicons/react/24/outline';
// Importa l'interfaccia Comment dal modulo activities
import { Comment } from '@/lib/activities';
// Importa le Server Actions per le operazioni CRUD sui commenti
import { addComment, editComment, deleteComment } from '@/lib/actions';

/**
 * Interfaccia Props per il componente CommentSection.
 * @property activityId - ID dell'attività a cui appartengono i commenti
 * @property comments - Array dei commenti esistenti
 * @property currentUserPiva - Partita IVA del logopedista corrente (per autorizzazione)
 * @property isPublic - Se true, mostra il form per aggiungere nuovi commenti
 */
interface Props {
  activityId: number;
  comments: Comment[];
  currentUserPiva: string;
  isPublic: boolean;
}

/**
 * Componente sezione commenti per un'attività.
 * Gestisce la visualizzazione, aggiunta, modifica ed eliminazione dei commenti.
 * Il form di aggiunta è visibile solo per le attività pubbliche.
 * La modifica e l'eliminazione sono permesse solo all'autore del commento.
 */
export default function CommentSection({ activityId, comments, currentUserPiva, isPublic }: Props) {
  // Hook per la navigazione e il refresh della pagina
  const router = useRouter();
  // Stato per il testo del nuovo commento in fase di scrittura
  const [newMessage, setNewMessage] = useState('');
  // Stato per tracciare l'invio del commento in corso
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Stato per l'ID del commento attualmente in modifica (null se nessuno)
  const [editingId, setEditingId] = useState<number | null>(null);
  // Stato per il testo del commento in fase di modifica
  const [editText, setEditText] = useState('');

  /**
   * Handler per l'aggiunta di un nuovo commento.
   * Chiama la Server Action addComment e ricarica i dati della pagina.
   */
  const handleAdd = async (e: React.FormEvent) => {
    // Previene il comportamento default del form
    e.preventDefault();
    // Se il messaggio è vuoto, non procedere
    if (!newMessage.trim()) return;

    // Attiva l'indicatore di invio in corso
    setIsSubmitting(true);
    // Chiama la Server Action per aggiungere il commento
    const res = await addComment(activityId, newMessage);
    if (res.success) {
      // Reset del campo e refresh della pagina per mostrare il nuovo commento
      setNewMessage('');
      router.refresh();
    } else {
      alert("Errore nell'invio del commento");
    }
    // Disattiva l'indicatore di invio
    setIsSubmitting(false);
  };

  /**
   * Handler per l'eliminazione di un commento.
   * Chiede conferma e chiama la Server Action deleteComment.
   */
  const handleDelete = async (commentId: number) => {
    // Chiede conferma all'utente prima di eliminare
    if (!confirm("Sei sicuro di voler eliminare questo commento?")) return;
    
    // Chiama la Server Action per eliminare il commento
    const res = await deleteComment(commentId);
    if (res.success) {
      // Refresh della pagina per aggiornare la lista
      router.refresh();
    } else {
      alert("Errore durante l'eliminazione");
    }
  };

  /**
   * Avvia la modalità modifica per un commento specifico.
   * Popola il campo di modifica con il testo attuale del commento.
   */
  const startEdit = (c: Comment) => {
    setEditingId(c.cod);
    setEditText(c.messaggio);
  };

  /**
   * Annulla la modifica in corso e resetta lo stato.
   */
  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  /**
   * Salva le modifiche al commento.
   * Chiama la Server Action editComment con il nuovo testo.
   */
  const saveEdit = async (commentId: number) => {
    // Se il testo è vuoto, non procedere
    if (!editText.trim()) return;
    
    // Chiama la Server Action per aggiornare il commento
    const res = await editComment(commentId, editText);
    if (res.success) {
      // Reset della modifica e refresh della pagina
      setEditingId(null);
      router.refresh();
    } else {
      alert("Errore durante la modifica");
    }
  };

  return (
    // Container principale della sezione commenti con sfondo grigio chiaro
    <div className="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-200 mt-8">
      {/* Titolo sezione con contatore commenti */}
      <h3 className="text-xl font-bold text-yellow-400 mb-6 flex items-center gap-2">
        Commenti <span className="text-sm font-normal text-yellow-400 bg-white px-2 py-0.5 rounded-full border">
          {/* Badge con il numero totale di commenti */}
          {comments.length}
        </span>
      </h3>

      {/* Lista dei commenti esistenti */}
      <div className="space-y-6 mb-8">
        {comments.length === 0 ? (
          // Messaggio quando non ci sono commenti
          <p className="text-gray-500 italic text-center py-4">Nessun commento presente.</p>
        ) : (
          // Itera ogni commento e lo renderizza come card
          comments.map((c) => (
            <div key={c.cod} className="flex gap-4 group">
              {/* Avatar del logopedista autore del commento */}
              <div className="flex-shrink-0 mt-1">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-yellow-400 shadow-sm text-yellow-400">
                  <UserCircleIcon className="w-6 h-6" />
                </div>
              </div>
              
              {/* Corpo del commento: card bianca con bordo arrotondato */}
              <div className="flex-grow bg-white p-4 rounded-xl rounded-tl-none border border-gray-100 shadow-sm relative">
                {/* Header del commento: nome autore + data */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    {/* Nome e cognome del logopedista */}
                    <span className="font-bold text-gray-800 text-sm block">
                      {c.nome_logopedista} {c.cognome_logopedista}
                    </span>
                    {/* Data e ora del commento formattata in italiano */}
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                      {new Date(c.data).toLocaleString('it-IT', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Pulsanti modifica/elimina: visibili solo per l'autore al hover */}
                  {c.id_logopedista === currentUserPiva && !editingId && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Pulsante modifica commento */}
                      <button onClick={() => startEdit(c)} className="p-1 text-gray-400 hover:text-yellow-500 transition" title="Modifica">
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      {/* Pulsante elimina commento */}
                      <button onClick={() => handleDelete(c.cod)} className="p-1 text-gray-400 hover:text-red-600 transition" title="Elimina">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Contenuto del commento: form di modifica oppure testo */}
                {editingId === c.cod ? (
                  // Form di modifica in-place del commento
                  <div className="mt-2">
                    {/* Textarea con il testo del commento da modificare */}
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full p-2 text-sm border border-yellow-400 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none mb-2 bg-yellow-50/50"
                      rows={2}
                    />
                    {/* Pulsanti Annulla e Salva per la modifica */}
                    <div className="flex justify-end gap-2">
                      <button onClick={cancelEdit} className="text-xs text-black hover:text-gray-700 font-bold px-3 py-1 bg-gray-100 rounded-lg">
                        Annulla
                      </button>
                      <button onClick={() => saveEdit(c.cod)} className="text-xs text-black bg-yellow-400 hover:bg-yellow-500 font-bold px-3 py-1 rounded-lg flex items-center gap-1">
                        <CheckIcon className="w-3 h-3" /> Salva
                      </button>
                    </div>
                  </div>
                ) : (
                  // Testo del commento in sola lettura
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {c.messaggio}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form per aggiungere un nuovo commento (visibile solo per attività pubbliche) */}
      {isPublic && (
        <form onSubmit={handleAdd} className="border-t border-gray-200 pt-6">
          {/* Etichetta del form */}
          <label className="block text-sm font-bold text-gray-700 mb-2">Lascia un commento</label>
          <div className="relative">
            {/* Textarea per scrivere il nuovo commento */}
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Scrivi qui il tuo commento..."
              className="w-full p-4 pr-12 rounded-xl border border-gray-300 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-50 outline-none transition resize-none shadow-sm"
              rows={3}
            />
            {/* Pulsante invio posizionato in basso a destra della textarea */}
            <button 
              type="submit" 
              disabled={isSubmitting || !newMessage.trim()}
              className="absolute bottom-3 right-3 p-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 disabled:bg-gray-300 transition shadow-sm"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
          {/* Nota informativa sulla visibilità del commento */}
          <p className="text-xs text-gray-400 mt-2 ml-1">
            Il commento sarà visibile a tutti gli utenti che visualizzano questa attività.
          </p>
        </form>
      )}
    </div>
  );
}