// Importazione dei font Google Inter e Lusitana dal modulo next/font
import { Inter, Lusitana } from 'next/font/google';
 
// Esportazione del font Inter con subset latino (font principale dell'app)
export const inter = Inter({ subsets: ['latin'] });
 
// Esportazione del font Lusitana con pesi 400 e 700 (usato per titoli e testi decorativi)
export const lusitana = Lusitana({
  weight: ['400', '700'],
  subsets: ['latin'],
});