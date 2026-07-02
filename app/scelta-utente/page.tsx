// Importa il componente Link di Next.js per la navigazione client-side
import Link from "next/link";

/**
 * Pagina di scelta del tipo di utente per la registrazione.
 * Presenta due card (Logopedista e Paziente) che linkano alla pagina di registrazione
 * con il parametro 'ruolo' appropriato nella query string.
 * Corrisponde alla route '/scelta-utente'.
 */
export default function SceltaUtentePage() {
	return (
		// Container principale: centrato verticalmente e orizzontalmente, altezza minima schermo intero
		<main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
			{/* Titolo della pagina: invita l'utente a scegliere il tipo di registrazione */}
			<h1 className="text-3xl font-bold text-gray-800">Scegli il tipo di registrazione</h1>

			{/* Sezione con le due card di scelta: layout a colonna, larghezza massima 896px */}
			<section className="flex w-full max-w-4xl flex-col gap-4">
				{/* Card Logopedista: link alla registrazione con ruolo=logopedista */}
				<Link
					href="/registrazione?ruolo=logopedista"
					className="w-full rounded-lg border bg-gray-50 p-6 text-center transition-colors hover:bg-blue-100"
				>
					{/* Titolo della card Logopedista */}
					<h3 className="text-xl font-bold text-blue-500">Logopedista</h3>
					{/* Descrizione dei vantaggi per il logopedista */}
					<p className="mt-2 text-sm text-gray-600">
						Gestisci i tuoi pazienti e crea attività personalizzate in pochi click.
					</p>
				</Link>

				{/* Card Paziente: link alla registrazione con ruolo=paziente */}
				<Link
					href="/registrazione?ruolo=paziente"
					className="w-full rounded-lg border bg-gray-50 p-6 text-center transition-colors hover:bg-blue-100"
				>
					{/* Titolo della card Paziente */}
					<h3 className="text-xl font-bold text-blue-500">Paziente</h3>
					{/* Descrizione dei vantaggi per il paziente */}
					<p className="mt-2 text-sm text-gray-600">
						Accedi ai tuoi esercizi e segui il tuo percorso riabilitativo ovunque sei.
					</p>
				</Link>
			</section>
		</main>
	);
}
