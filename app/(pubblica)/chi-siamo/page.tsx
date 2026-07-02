// Importa il font personalizzato Lusitana dal modulo fonts
import { lusitana } from '../../ui/fonts';

/**
 * Pagina "Chi Siamo" della sezione pubblica del sito.
 * Presenta il progetto LogSpot, la vision del team, la filosofia di collaborazione
 * e i nomi dei membri del team di sviluppo.
 * Corrisponde alla route '/chi-siamo'.
 */
export default function Page() {
  return (
    // Container principale: larghezza massima 896px (max-w-4xl)
    <main className="max-w-4xl">
      {/* Titolo della pagina "Chi Siamo" con font Lusitana, colore blu, centrato */}
      <h1 className={`${lusitana.className} mb-6 text-3xl text-blue-600 font-bold text-center mt-10`}>
        Chi Siamo
      </h1>

      {/* Sezione contenuto principale: spaziatura verticale tra elementi, testo grigio */}
      <section className="space-y-6 text-gray-700 leading-relaxed">
        {/* Paragrafo introduttivo: descrizione del progetto LogSpot e della sua missione */}
        <p className="text-lg text-center px-4 md:px-0">
          <strong>LogSpot</strong>, un progetto nato dall'esigenza di colmare un vuoto tecnologico e organizzativo nel panorama della logopedia italiana. Il nostro team ha lavorato con l'obiettivo di creare la prima piattaforma centralizzata e accessibile dedicata interamente a questa disciplina.
Il nome stesso, LogSpot, unisce 'Logopedia' e 'Spot', a indicare il nostro obiettivo: fare luce su un settore spesso frammentato e offrire un punto di riferimento unico. Non abbiamo voluto creare semplicemente un contenitore di file, ma un vero ecosistema digitale che faciliti il lavoro dei professionisti e migliori la qualità della vita dei pazienti.

        </p>

        {/* Griglia a due colonne con le sezioni Vision e Collaborazione */}
        <div className="grid gap-8 md:grid-cols-2 mt-10">
          {/* Card Vision: bordo sinistro blu con descrizione della missione */}
          <div className="border-l-4 border-blue-500 pl-4">
            {/* Titolo della sezione Vision con font Lusitana */}
            <h2 className={`${lusitana.className} text-xl font-semibold text-blue-800`}>La nostra Vision</h2>
            {/* Testo descrittivo della vision del progetto */}
            <p className="mt-2">
              Vogliamo eliminare la frammentazione delle risorse riabilitative, creando un punto di incontro digitale 
              tra il professionista e il paziente.
            </p>
          </div>

          {/* Card Collaborazione: bordo sinistro blu con descrizione dell'ecosistema collaborativo */}
          <div className="border-l-4 border-blue-500 pl-4">
            {/* Titolo della sezione Collaborazione con font Lusitana */}
            <h2 className={`${lusitana.className} text-xl font-semibold text-blue-800`}>Collaborazione</h2>
            {/* Testo descrittivo della filosofia collaborativa */}
            <p className="mt-2">
              LogSpot non è solo un archivio, ma un ecosistema dove i logopedisti possono condividere materiali 
              validati e ricevere feedback dalla comunità.
            </p>
          </div>
        </div>

        {/* Sezione Team di Sviluppo: sfondo blu chiaro con i nomi dei membri */}
        <div className="mt-12 bg-blue-50 p-6 rounded-xl">
          {/* Titolo della sezione team con font Lusitana, centrato */}
          <h2 className={`${lusitana.className} text-xl font-semibold mb-4 text-blue-900 text-center`}>
            Il Team di Sviluppo
          </h2>
          {/* Layout flex con i tre nomi dei membri del team disposti orizzontalmente */}
          <div className="flex gap-4 mt-6">
            {/* Primo membro: allineato a sinistra */}
            <p className="flex-1 text-left">Capriati Marco</p>
            {/* Secondo membro: centrato */}
            <p className="flex-1 text-center">Covelli Tommaso</p>
            {/* Terzo membro: allineato a destra */}
            <p className="flex-1 text-right">Bottalico Alessio</p>
          </div>
        </div>
      </section>
    </main>
  );
}