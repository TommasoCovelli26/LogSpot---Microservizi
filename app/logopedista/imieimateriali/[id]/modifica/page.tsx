// Importa la funzione notFound da Next.js per mostrare la pagina 404
import { notFound } from 'next/navigation';
// Importa la funzione fetchActivityById per recuperare un'attività dal database per ID
import { fetchActivityById } from '../../../../lib/activities';
// Importa il componente EditForm che gestisce il form di modifica dell'attività
import EditForm from '../../../../ui/logopedista/edit-form';

/**
 * Pagina di modifica di un'attività esistente.
 * Recupera i dati dell'attività dal database e li passa al componente EditForm.
 * Se l'attività non esiste, mostra la pagina 404.
 * Corrisponde alla route '/logopedista/imieimateriali/[id]/modifica'.
 */
export default async function EditActivityPage({ 
  params 
}: { 
  params: Promise<{ id: string }>  // Parametri dinamici dell'URL (id dell'attività)
}) {
  // Estrae l'id dell'attività dai parametri dinamici della route
  const { id } = await params;
  // Recupera l'attività dal database usando l'ID fornito
  const activity = await fetchActivityById(id);

  // Se l'attività non esiste nel database, mostra la pagina 404 di Next.js
  if (!activity) {
    notFound();
  }

  return (
    // Container principale: sfondo bianco, padding responsivo
    <main className="w-full min-h-screen bg-white p-4 md:p-8 font-sans">
      {/* Renderizza il componente EditForm passando i dati dell'attività da modificare */}
      <EditForm activity={activity} />
    </main>
  );
}