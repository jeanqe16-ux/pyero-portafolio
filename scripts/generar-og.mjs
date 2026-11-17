// Genera las imágenes para compartir (public/og.png y public/og-en.png, 1200x630) con el estilo actual del inicio:
// lienzo crema con orbes, titular con la última palabra en naranja, la caja tipo app de IA y una fila de trabajo real.
// Uso: node scripts/generar-og.mjs  (correrlo cada vez que cambie el titular; usa Microsoft Edge en modo headless)
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const R = process.cwd().replaceAll('\\', '/');
const TMP = `${R}/.tmp/og`;
mkdirSync(TMP, { recursive: true });

const textos = JSON.parse(readFileSync('src/data/textos.json', 'utf8'));
const { casos } = JSON.parse(readFileSync('src/data/casos.json', 'utf8'));
const { posts } = JSON.parse(readFileSync('src/data/diseno.json', 'utf8'));
const lugar = { es: 'Huancayo, Perú', en: 'Huancayo, Peru' };

// Fila de trabajo real: los dos primeros reels de cada caso y un post por cliente, en 4:5 con sus esquinas
const piezas = [...casos.flatMap((c) => c.videos.slice(0, 2).map((v) => v.poster)), ...casos.map((c) => posts.find((p) => p.cliente === c.cliente)?.imagenes[0])]
  .filter(Boolean)
  .slice(0, 7);
const fila = piezas.map((src) => `<figure><img src="file:///${R}/src/media${src.replace('/media', '')}"><i></i><i></i><i></i><i></i></figure>`).join('');

for (const lang of ['es', 'en']) {
  const t = textos[lang].hero;
  const a = textos[lang].apertura;
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Inter; src: url('file:///${R}/node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'); font-weight: 100 900; }
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; overflow: hidden; position: relative; background: #edebe6; color: #0a0a0a; font-family: Inter, sans-serif; -webkit-font-smoothing: antialiased; text-align: center; }
.orbe { position: absolute; left: 50%; top: 300px; width: 1100px; height: 520px; transform: translate(-50%, -50%); filter: blur(70px); opacity: .8; }
.orbe i { position: absolute; border-radius: 50%; }
.orbe i:nth-child(1) { inset: 18% 46% 22% 14%; background: #ffc59e; }
.orbe i:nth-child(2) { inset: 26% 18% 16% 44%; background: #cdbbff; }
.orbe i:nth-child(3) { inset: 40% 38% 20% 36%; background: #fb8e1f; opacity: .5; }
.contenido { position: relative; padding-top: 44px; }
.arriba { display: flex; justify-content: space-between; align-items: center; padding: 0 60px; font-size: 20px; color: #6b675f; }
.nombre { font-size: 22px; font-weight: 600; letter-spacing: -0.02em; color: #0a0a0a; }
.nombre b { color: #fb8e1f; font-weight: inherit; }
h1 { margin: 38px auto 0; font-size: 58px; font-weight: 560; line-height: 1.08; letter-spacing: -0.045em; }
h1 em { color: #fb8e1f; font-style: normal; }
.caja { position: relative; width: 640px; margin: 30px auto 0; padding: 20px 18px 14px 24px; border: 1px solid #dcd8d0; border-radius: 18px; background: #f8f7f4; box-shadow: 0 28px 60px -34px rgba(60,40,20,.55); text-align: left; }
.ejemplo { font-size: 21px; color: #6b675f; }
.ejemplo::after { content: ''; display: inline-block; width: 2px; height: 1.1em; margin-left: 2px; vertical-align: -0.15em; background: #0a0a0a; }
.pie { display: flex; justify-content: space-between; align-items: center; margin-top: 34px; color: #6b675f; font-size: 22px; }
.derecha { display: flex; align-items: center; gap: 14px; }
.modelo { color: #0a0a0a; font-size: 17px; font-weight: 500; }
.enviar { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 10px; background: #fb8e1f; }
.enviar svg { width: 20px; height: 20px; }
.cursor { position: absolute; right: -58px; bottom: -34px; display: flex; align-items: flex-start; gap: 2px; }
.cursor svg { width: 18px; height: 18px; fill: #fb8e1f; stroke: #f8f7f4; stroke-width: 1.2; filter: drop-shadow(0 2px 3px rgba(0,0,0,.25)); }
.cursor span { margin-top: 13px; padding: 3px 8px; border-radius: 6px 6px 6px 2px; background: #fb8e1f; font-size: 13px; font-weight: 600; box-shadow: 0 3px 10px -2px rgba(0,0,0,.3); }
.fila { position: absolute; left: 0; right: 0; bottom: -24px; display: flex; justify-content: center; align-items: flex-start; gap: 26px; }
figure { position: relative; flex: none; width: 112px; height: 140px; }
figure img { width: 100%; height: 100%; object-fit: cover; border-radius: 4px; }
figure i { position: absolute; width: 6px; height: 6px; background: #0a0a0a; }
figure i:nth-of-type(1) { top: -9px; left: -9px; } figure i:nth-of-type(2) { top: -9px; right: -9px; }
figure i:nth-of-type(3) { bottom: -9px; left: -9px; } figure i:nth-of-type(4) { bottom: -9px; right: -9px; }
</style></head><body>
<div class="orbe"><i></i><i></i><i></i></div>
<div class="contenido">
  <div class="arriba"><span class="nombre">Pyero<b>.workz</b></span><span>${lugar[lang]}</span></div>
  <h1>${t.titulo.a} ${t.titulo.b} ${t.titulo.b2 ?? ''}<br>${t.titulo.c} <em>${t.titulo.d}</em></h1>
  <div class="caja">
    <div class="ejemplo">${a.pedidos[0]}</div>
    <div class="pie"><span>+</span><span class="derecha"><span class="modelo">${a.cursor} ⌄</span><span class="enviar"><svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg></span></span></div>
    <div class="cursor"><svg viewBox="0 0 16 16"><path d="M1.5 1.2 14 7.3l-5.6 1.5-2.4 5.4z"/></svg><span>${a.cursor}</span></div>
  </div>
</div>
<div class="fila">${fila}</div>
</body></html>`;
  writeFileSync(`${TMP}/${lang}.html`, html);
  const crudo = `${TMP}/${lang}.png`;
  spawnSync(EDGE, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1200,630', '--virtual-time-budget=5000', '--allow-file-access-from-files', `--user-data-dir=${TMP}/perfil`, `--screenshot=${crudo}`, `file:///${TMP}/${lang}.html`]);
  const salida = `public/og${lang === 'es' ? '' : '-en'}.png`;
  const info = await sharp(crudo).resize(1200, 630, { fit: 'cover', position: 'top' }).png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(salida);
  console.log(`${salida}: ${info.width}x${info.height}, ${(info.size / 1024).toFixed(0)} KB`);
}
rmSync(TMP, { recursive: true, force: true, maxRetries: 5, retryDelay: 400 });
