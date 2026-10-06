import { casos } from '../data/casos.json';
import { clientes } from '../data/clientes.json';
import { creadores } from '../data/creadores.json';
import { tr, type Idioma } from './i18n';

// Anchos y tamaño en pantalla de las portadas de los reels; los comparten el hero y la precarga del <head>
export const ANCHOS_REEL = [240, 360, 520];
export const SIZES_REEL = '(max-width: 820px) 58vw, 232px';

/** Reels del hero: el primer video de cada caso y luego los de los creadores. */
export const reelsDe = (lang: Idioma) => [
  ...casos
    .filter((c) => c.videos.length > 0)
    .map((c) => ({
      nombre: clientes.find((cl) => cl.id === c.cliente)?.nombre ?? c.cliente,
      categoria: tr(c, 'categoria', lang),
      video: c.videos[0].video,
      poster: c.videos[0].poster,
    })),
  ...creadores.map((c) => ({ nombre: c.handle, categoria: tr(c, 'categoria', lang), video: c.video, poster: c.poster })),
];
