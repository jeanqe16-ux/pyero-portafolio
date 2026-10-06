import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';

// La dirección pública del sitio se edita en src/data/site.json (campo url)
const { url } = JSON.parse(readFileSync(new URL('./src/data/site.json', import.meta.url), 'utf8'));

export default defineConfig({
  site: url || undefined,
  // Todo el CSS va dentro del HTML para que ninguna hoja de estilos bloquee el primer pintado
  build: { inlineStylesheets: 'always' },
});
