import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';

// Imágenes de src/media, que Astro optimiza en el build. Los JSON las nombran por su ruta pública (/media/...).
// Una ruta que no esté en src/media (por ejemplo, algo subido a public/media) se usa tal cual, sin optimizar.
const locales = import.meta.glob<ImageMetadata>('/src/media/**/*.{webp,jpg,jpeg,png,avif}', { eager: true, import: 'default' });

export const local = (ruta: string): ImageMetadata | undefined => locales[`/src${ruta}`];

const CALIDAD = { avif: 50, webp: 72 };

/** URL de la imagen en WebP al ancho pedido (nunca más grande que el original). */
export async function optimizar(ruta: string, ancho: number, formato: keyof typeof CALIDAD = 'webp') {
  const imagen = local(ruta);
  if (!imagen) return ruta;
  return (await getImage({ src: imagen, width: Math.min(ancho, imagen.width), format: formato, quality: CALIDAD[formato] })).src;
}

/** Valor de srcset con una versión por ancho, para que el navegador elija la del tamaño en que se muestra. */
export async function conjunto(ruta: string, anchos: number[], formato: keyof typeof CALIDAD) {
  const imagen = local(ruta);
  if (!imagen) return '';
  const utiles = [...new Set(anchos.map((a) => Math.min(a, imagen.width)))];
  return (await Promise.all(utiles.map(async (a) => `${await optimizar(ruta, a, formato)} ${a}w`))).join(', ');
}
