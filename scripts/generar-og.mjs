// Genera las imágenes para compartir (public/og.png y public/og-en.png, 1200x630) con el titular del hero.
// Uso: node scripts/generar-og.mjs  (correrlo cada vez que cambie el titular; usa Microsoft Edge en modo headless)
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const R = process.cwd().replaceAll('\\', '/');
const TMP = `${R}/.tmp/og`;
mkdirSync(TMP, { recursive: true });

const textos = JSON.parse(readFileSync('src/data/textos.json', 'utf8'));
const PALETA = ['#fb8e1f', '#fb8e1f', '#fdaf50', '#ffd166', '#ff7a59', '#0a0a0a'];
// Azar con semilla fija para que las imágenes salgan iguales en cada corrida
let semilla = 7;
const azar = () => ((semilla = (semilla * 16807) % 2147483647) - 1) / 2147483646;
const sueltos = Array.from({ length: 70 }, () => {
  const lado = 10 + Math.floor(azar() * 3) * 6;
  return `<i style="left:${Math.round(azar() * 1190)}px;top:${Math.round(azar() * 560)}px;width:${lado}px;height:${lado}px;background:${PALETA[Math.floor(azar() * 5)]};opacity:${(0.1 + azar() * 0.22).toFixed(2)}"></i>`;
}).join('');
const mosaico = Array.from({ length: 80 }, (_, i) => `<i style="left:${(i % 40) * 30}px;top:${Math.floor(i / 40) * 30}px;background:${azar() < 0.22 ? '#fff' : PALETA[Math.floor(azar() * PALETA.length)]}"></i>`).join('');
const lineas = { es: 'Edición de video · Motion graphics · Diseño', en: 'Video editing · Motion graphics · Design' };
const lugar = { es: 'Huancayo, Perú', en: 'Huancayo, Peru' };

for (const lang of ['es', 'en']) {
  const t = textos[lang].hero.titulo;
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Inter; src: url('file:///${R}/node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'); font-weight: 100 900; }
@font-face { font-family: Silkscreen; src: url('file:///${R}/public/fonts/silkscreen-700.woff2'); font-weight: 700; }
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; overflow: hidden; position: relative; background: #fff; color: #0a0a0a; font-family: Inter, sans-serif; -webkit-font-smoothing: antialiased; }
i { position: absolute; display: block; }
.mosaico { position: absolute; left: 0; bottom: 0; width: 1200px; height: 60px; }
.mosaico i { width: 30px; height: 30px; }
.marco { position: absolute; inset: 0 0 60px; padding: 56px 72px 44px; display: flex; flex-direction: column; justify-content: space-between; }
.arriba, .abajo { display: flex; justify-content: space-between; align-items: center; font-size: 26px; color: #6b6b6b; }
.nombre { font-family: Silkscreen; font-size: 44px; letter-spacing: -0.06em; color: #0a0a0a; }
.nombre b, h1 em { color: #fb8e1f; font-style: normal; font-weight: inherit; }
h1 { max-width: 1040px; font-size: 80px; font-weight: 600; line-height: 1.04; letter-spacing: -0.045em; }
.chip { display: inline-grid; place-items: center; width: 1.25em; height: 0.82em; border-radius: 0.24em; background: #0a0a0a; vertical-align: 0.02em; transform: rotate(-4deg); }
.chip.claro { background: #fb8e1f; transform: rotate(4deg); }
.chip svg { width: 0.5em; height: 0.5em; }
</style></head><body>${sueltos}
<div class="marco">
  <div class="arriba"><span class="nombre">Pyero<b>.workz</b></span><span>${lugar[lang]}</span></div>
  <h1>${t.a} <span class="chip"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="#fff"/></svg></span> <em>${t.b}</em> ${t.b2 ?? ''} ${t.c} <span class="chip claro"><svg viewBox="0 0 24 24"><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" fill="#fff"/></svg></span> <em>${t.d}</em></h1>
  <div class="abajo"><span>${lineas[lang]}</span></div>
</div>
<div class="mosaico">${mosaico}</div>
</body></html>`;
  writeFileSync(`${TMP}/${lang}.html`, html);
  const crudo = `${TMP}/${lang}.png`;
  spawnSync(EDGE, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1200,630', '--virtual-time-budget=5000', `--user-data-dir=${TMP}/perfil`, `--screenshot=${crudo}`, `file:///${TMP}/${lang}.html`]);
  const salida = `public/og${lang === 'es' ? '' : '-en'}.png`;
  const info = await sharp(crudo).resize(1200, 630, { fit: 'cover', position: 'top' }).png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(salida);
  console.log(`${salida}: ${info.width}x${info.height}, ${(info.size / 1024).toFixed(0)} KB`);
}
rmSync(TMP, { recursive: true, force: true, maxRetries: 5, retryDelay: 400 });
