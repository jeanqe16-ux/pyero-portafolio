import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site, url }) =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', site ?? url).href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
