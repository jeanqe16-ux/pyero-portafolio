// Genera las miniaturas (.min.webp) que usan los casos de estudio.
// Uso: node scripts/generar-miniaturas.mjs  (correrlo después de agregar posts, portadas o portadas de video)
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const recorrer = (dir) => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? recorrer(join(dir, n)) : [join(dir, n)]));
const originales = recorrer('public/media').filter((f) => /[\\/](posts|portadas|videos)[\\/]/.test(f) && f.endsWith('.webp') && !f.endsWith('.min.webp'));

let total = 0;
for (const original of originales) {
  // El lado más corto queda en 200 px: suficiente para un cuadro de 60 px en pantallas de alta densidad
  const info = await sharp(original).resize({ width: 200, height: 200, fit: 'outside' }).webp({ quality: 72 }).toFile(original.replace(/\.webp$/, '.min.webp'));
  total += info.size;
}
console.log(`${originales.length} miniaturas, ${(total / 1024).toFixed(0)} KB en total`);
