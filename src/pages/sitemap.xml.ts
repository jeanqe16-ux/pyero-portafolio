import type { APIRoute } from 'astro';
import { ruta, type Idioma } from '../lib/i18n';

// Mapa del sitio: la portada en cada idioma, enlazadas entre sí como alternativas
export const GET: APIRoute = ({ site, url }) => {
  const idiomas: Idioma[] = ['es', 'en'];
  const direccion = (lang: Idioma) => new URL(ruta(lang), site ?? url).href;
  const hoy = new Date().toISOString().slice(0, 10);
  const alternativas = [
    ...idiomas.map((lang) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${direccion(lang)}" />`),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${direccion('es')}" />`,
  ].join('\n');
  const paginas = idiomas
    .map((lang) => `  <url>\n    <loc>${direccion(lang)}</loc>\n    <lastmod>${hoy}</lastmod>\n${alternativas}\n  </url>`)
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${paginas}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
