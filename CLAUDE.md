# Portafolio Pyero.workz

Portafolio de una sola página para Pyero.workz (Jean, editor y motion designer en Huancayo). El mensaje es general: marcas de salud, IA y otras. Sitio estático en Astro 7, en español (`/`) e inglés (`/en/`). El brief original está en `brief.md` y las referencias visuales en `referencias/`.

## Comandos

- `npm run dev`: servidor de desarrollo en http://localhost:4321/
- `npm run build`: genera `dist/`
- Si tras cambios grandes el servidor muestra estilos rotos, reiniciarlo antes de buscar un fallo en el código (ya pasó una vez por caché).

## Estructura

```
src/
  data/            Todo el contenido editable (JSON)
    site.json        Marca, dirección pública (url), persona, ubicación, WhatsApp, redes, SEO
    textos.json      Textos de todas las secciones y escenas, en `es` y `en`
    cifras.json      Las tres cifras de trabajo (prefijo, valor y texto)
    casos.json       Casos de estudio: reto, lo que hice, resultado y videos
    proceso.json     Los tres pasos del proceso
    clientes.json    Clientes (id, nombre, logo y color de marca) para el inicio, Trabajos y el mosaico de marcas
    diseno.json      Posts (una o varias imágenes) y portadas por cliente; se muestran dentro de cada caso
    creadores.json   Handles, enlaces y reels de creadores
    servicios.json   Título, texto e icono de cada servicio (pestañas del inicio y datos estructurados)
    herramientas.json  Nombre, sigla y colores de cada herramienta
  layouts/Base.astro   <head>, SEO, menú compacto, footer, WhatsApp flotante, animación de entrada
  components/        Inicio (arma la página), Imagen (picture con srcset), Apertura, Trabajos, Toma, Casos, Nodos, Clientes, Sobre, Herramientas, Cierre, Redes
  pages/index.astro, pages/en/index.astro   Solo llaman a Inicio con su idioma
  pages/sitemap.xml.ts, pages/robots.txt.ts   Generados en el build a partir de la url del sitio
  pages/404.astro    Página 404 con mini juego de pixeles; una sola para ambos idiomas (pasa a inglés si la dirección empieza con /en/)
  styles/global.css  Variables, base, botones, navegación
  lib/enlaces.ts     Enlace de WhatsApp e iconos SVG compartidos
  lib/i18n.ts        textosDe(lang), tr(objeto, campo, lang) y ruta(lang)
  lib/imagenes.ts    optimizar(ruta, ancho) y conjunto(ruta, anchos, formato) sobre las imágenes de src/media
  lib/reels.ts       Reels (primer video de cada caso y creadores)
  scripts/escena.ts  Escena ligada al scroll (montarEscena, la usa el cierre), cursores con nombre y salto()
  media/<cliente>/   posts/, portadas/ y portadas de video (videos/*.webp), más yo.jpg: imágenes que Astro optimiza
  scripts/interacciones.ts   Botones magnéticos y easter egg; se carga diferido
  scripts/barrido.ts Barrido de pixeles al cambiar de página, sobre las View Transitions de Astro
public/media/<cliente>/   logo.png y videos/*.mp4 (se sirven tal cual; ruta pública /media/...)
public/media/creadores/videos/   Reels de creadores
public/og.png, og-en.png  Imágenes al compartir (1200x630), una por idioma
public/favicon.*, icon-*.png, apple-touch-icon.png, site.webmanifest   Iconos del sitio
scripts/generar-og.mjs     Regenera og.png y og-en.png con el titular del hero (usa Edge headless)
.pages.yml           Configuración de Pages CMS sobre los JSON de src/data
wrangler.jsonc       Despliegue en Cloudflare Workers: sirve ./dist como assets estáticos
```

Estilo "film de lanzamiento" con estructura limpia como la web de Base44: lienzo crema con grano, orbes de degradado, textos chicos y centrados, cursor con nombre "Pyero" y cambios de imagen con saltito. Orden: Apertura (titular, caja tipo app de IA, pestañas Video ▪ Motion ▪ Diseño y fila de trabajos) → Trabajos (filas de cuatro por grupo: edición, motion y cada cliente) → Toma (un reel real a pantalla completa, en silencio, con una frase) → Casos de estudio → Proceso (cuatro pasos como líneas de texto grande que se encienden al bajar; el cursor señala el actual) → Marcas y creadores (mosaico de logos y creadores en texto) → Sobre mí → Cierre (punto naranja que llena la pantalla, pastillas de plataformas que el cursor marca y WhatsApp). Se quitaron a pedido: el diseño anterior (hero con foto y WebGL, abanico de reels, franja negra, tarjetas de servicios, pixeles, modo oscuro), las escenas de edición de video, motion y diseño, y la sección de cifras.

## Decisiones tomadas

- **Contenido en JSON, no en `.ts` ni en colecciones de contenido**: debe poder editarse desde Pages CMS. Cada lista va envuelta en un objeto (`{ "proyectos": [...] }`). Al agregar un campo a un JSON, agregarlo también en `.pages.yml`.
- **Ningún texto visible va escrito en los componentes**: sale de `src/data/`.
- **Marca**: Pyero.workz (no Pyero.visualz). Redes: instagram.com/pyero.workz y tiktok.com/@pyero.workz.
- **Dos idiomas**: español e inglés con selector ES/EN en el encabezado. Los textos de sección van en `textos.json` bajo `es` y `en`; en los demás JSON el inglés va en campos con sufijo `_en` (si falta, se usa el español). Todo componente recibe `lang`. Los títulos de posts y portadas no se traducen.
- **Sin testimonios ni cifras inventadas**: los resultados de los casos son cualitativos. Las cifras de trabajo (+15 proyectos, +5 marcas, 2 años) las dio el usuario; si `valor` queda vacío se muestra el marcador de `textos.json > prueba.pendiente`.
- **Casos**: cada caso tiene un espacio principal (4:5) y una columna de miniaturas a la derecha, desplazable si son muchas (fila deslizable en celular). Las miniaturas son sus videos de `casos.json` y luego los posts y portadas de ese cliente en `diseno.json`; al hacer clic la pieza se muestra en el espacio principal, sin recortarse.
- **Librerías**: solo `@fontsource-variable/inter` y `gsap` (con ScrollTrigger, para las escenas ligadas al scroll). El resto de animaciones e interacciones va en CSS y JS propio; no agregar más sin que se pida.
- **Colores**: `--acento` (#FB8E1F) para elementos grandes o decorativos (botón de enviar, cabezal, punto del cierre); `--acento-texto` (#A0470A, 5.2:1 sobre el crema, AA) para todo texto pequeño en naranja (etiquetas de sección); `--orbe-durazno` y `--orbe-lila` para orbes y elementos de las escenas. Fondo crema `--fondo` (#edebe6) con grano SVG. Los titulares no llevan palabras en naranja ni negritas fuertes (peso 520 a 560).
- **Hover**: siempre dentro de `@media (hover: hover) and (pointer: fine)`.
- **Movimiento**: toda animación respeta `prefers-reduced-motion`.
- **Uniformidad**: las piezas de una misma fila tienen todas la misma forma (4:5) y no se mezclan entre grupos (videos con videos, posts con posts). Toda pieza real (imagen, video o post) lleva sus cuatro esquinas de selección (`.esquina`, cuadritos negros de 6 px a 9 px de la imagen), siempre visibles; los iconos y formas no llevan esquinas. En el inicio cada pestaña (Video, Motion, Diseño) tiene su propia fila, sin repetir piezas entre pestañas ni rellenar con piezas de otra: muestra solo lo que existe (hasta 3 por marca), agrupado por marca, y antes de cada marca va un cuadrito con su logo en blanco y su nombre debajo (sin esquinas). En escritorio la fila se achica para entrar completa (`--huecos` y `--factor` calculados en `Apertura.astro`); en celular se desliza de lado. En Trabajos, cada grupo tiene un `.cuadrito` de icono (`lib/iconos.ts`) junto a su nombre. Todas las secciones usan el ancho `--contenido` (72rem, como el menú) para que la web no quede vacía. Cada marca tiene su color en `clientes.json > color` (sacado de sus posts: CERO verde, Imagen morado, Zárate azul petróleo) y sus cuadros usan ese color de fondo con el logo encima en sus colores originales (`<img>` con `object-fit: contain`, nunca estirado). El logo de CERO conserva su amarillo. Los creadores van como texto. Las cabeceras de sección usan `.cabecera-chica` (etiqueta naranja chica y `h2` de 1.15 a 1.45 rem).
- **Enlaces externos**: `target="_blank"` con `rel="noopener noreferrer"`.
- **Textos del sitio**: sin emojis ni guiones largos.
- **Videos**: reels verticales 1080x1920 en H.264 con `+faststart`. Se ven en el visor de Trabajos (`<dialog>` con controles y sonido) y en los casos.
- **Material fuente**: `videos-originales/` y `material-original/` están en `.gitignore`; solo se versiona lo optimizado en `public/media/`.
- **Medios**: videos en H.264 con `+faststart` (máximo 1080p, idealmente menos de 10 MB) en `public/media`; imágenes fuente en WebP de máximo 1600 px en `src/media`; logos en PNG transparente en sus colores (claros, para ir sobre el color de la marca) en `public/media`.
- **Clientes**: el `id` de `clientes.json` es el nombre de su carpeta en `src/media/` y `public/media/` y el valor de `cliente` en `diseno.json` y `casos.json`.
- **Sin páginas de proyecto**: los casos de estudio van en la portada. Los logos del mosaico de marcas enlazan a `#caso-<id>`.
- **Cierre con scroll**: `<section class="escena-scroll">` con alto `--largo` y un `.escena-fija` pegajoso de 100svh; `montarEscena()` pide GSAP al acercarse y llama a `pintar(p)` con el avance de 0 a 1, que debe ser determinista. Con `prefers-reduced-motion` queda la pantalla naranja quieta (`.estatica`). No agregar escenas largas que detengan el scroll: se quitaron a pedido.
- **Saltito (stepped stagger)**: el cambio de imágenes imita la web de Base44: corte seco, la pieza nueva entra corrida unos píxeles y se asienta en escalón (`.salto` en `global.css`, `step-end`), en cascada de izquierda a derecha. No usar fundidos ni glitch en los textos.
- **Apertura al estilo Base44**: la primera vez (`window.__collageVisto`) las piezas de la fila aparecen sueltas y giradas y caen a su sitio una por una; la última palabra del titular (`hero.titulo.d` y `hero.alternativas`) alterna en naranja con corte seco, con ancho fijo al de la palabra más larga para que el titular no se mueva; los orbes derivan de tono (aurora). Nada de esto corre con `prefers-reduced-motion`.
- **Caja del inicio**: el cursor Pyero escribe pedidos de `textos.json > apertura.pedidos`, pulsa enviar y pasa a la siguiente pestaña (Video, Motion, Diseño); la fila cambia a las piezas de esa categoría. Si el visitante escribe y envía, se abre WhatsApp con su pedido y la categoría elegida.
- **Espaciado**: las secciones usan `clamp(3rem, 5.5vw, 4.5rem)` de relleno vertical (48 px en celular, 72 px en escritorio) y unos 2rem entre titular y contenido. Mantenerlo compacto.
- **SEO y compartir**: la dirección pública vive en `site.json > url` (hoy `https://pyero-portafolio.jeanqe16.workers.dev`); de ahí salen canonical, hreflang, Open Graph, Twitter, sitemap y robots. Si cambia el dominio, basta con editar ese campo. `Base.astro` incluye los datos estructurados (`ProfessionalService` con su `Person`, en Huancayo, Perú). Las imágenes og llevan el titular del hero: si cambia el titular, hay que regenerarlas con `node scripts/generar-og.mjs`.
- **Imágenes**: las de `src/media` se nombran en los JSON por su ruta pública (`/media/...`) y `lib/imagenes.ts` las resuelve y optimiza en el build. `Imagen.astro` genera `<picture>` con AVIF y WebP en varios anchos; para una sola URL (miniaturas de 160 px, portadas de video de 640 px, imágenes grandes de 900 px) se usa `optimizar()`. Una ruta que no exista en `src/media` se usa tal cual, sin optimizar. Los estilos de un `<img>` que sale de `Imagen.astro` necesitan `:global(img)` en el componente padre.
- **Menú**: barra flotante de vidrio compacta (Trabajos, Casos, Sobre mí, ES/EN y Hablemos). `.nav` no ocupa alto; una página que no empiece con la apertura debe dejarle sitio con `--alto-nav`, como hace la 404.
- **Rendimiento (LCP)**: el LCP es el titular de la apertura, así que todo el CSS va dentro del HTML (`build.inlineStylesheets: 'always'`) y la única fuente es Inter (fontsource, precargada; la bit Silkscreen se quitó con los pixeles). Las imágenes de la fila del inicio van optimizadas a 280 px; GSAP solo se descarga cuando el cierre se acerca. Todo video usa `preload="none"`.
- **Favicon**: no hay un logo propio de Pyero.workz; los iconos salen de la marca provisional (cuadro negro con triángulo naranja de `favicon.svg`).
- **View Transitions**: `Base.astro` usa `<ClientRouter />`, así que al cambiar de idioma la página no se recarga. Por eso todo script de componente va dentro de `document.addEventListener('astro:page-load', ...)`, y los módulos diferidos exportan `iniciar()`, que `Base.astro` vuelve a llamar tras cada cambio de página (limpian lo anterior antes de empezar). La animación por defecto está desactivada (`transition:animate="none"`); el barrido lo pinta `scripts/barrido.ts` en un lienzo colgado de `<html>` para que sobreviva al reemplazo del `<body>`.
- **Interacciones** (se desactivan con `prefers-reduced-motion`; los botones magnéticos solo con mouse): el easter egg se dispara al teclear "pyero". No hay cursor personalizado ni decodificación de títulos (se quitaron a pedido). No tocar la selección de texto ni el comportamiento al hacer clic en los textos.
- **Sin modo oscuro**: se quitó con el rediseño. Todo color nuevo debe salir de las variables de `global.css`.
- **Accesibilidad**: enlace `.saltar` ("Saltar al contenido") al inicio del `<body>`, visible solo al enfocarlo; `main` tiene `id="contenido"`. Todo `[id]` lleva `scroll-margin-top` para no quedar bajo el menú flotante. En la caja del inicio, Enter envía y Shift+Enter hace salto de línea.
- **Nombres de clase**: `.pie` es el footer global, `.redes` el grupo de iconos sociales y `.marca` el logo del menú (pinta de naranja sus `span`); no reutilizarlos dentro de componentes.
- **Git**: un commit por fase. Los commits usan el correo privado de GitHub (noreply), configurado solo en este repositorio; no publicar el correo personal. `referencias/` está en `.gitignore` y fuera del historial. La rama `respaldo-local-sin-publicar` conserva el historial anterior y no debe subirse.

## Pendientes

- Revisar la redacción de los casos de estudio y la traducción al inglés.
- "CERO Motion" y "CERO Ubicación" siguen sin audio (uno no tenía sound design); confirmar cuál y restaurar el del otro.
- Regenerar las imágenes og (`node scripts/generar-og.mjs`) con el estilo nuevo; el script todavía apunta al hero anterior y hay que adaptarlo.
- Pasar Lighthouse en una máquina con el paquete instalado (`npx lighthouse`): desde Claude Code no se pudo instalar.
- Agregar los enlaces de @Even_Sales, @Loreimp y @Basee44 en `creadores.json`.
- Si se conecta un dominio propio, actualizar `site.json > url`.
- Reemplazar el favicon provisional cuando exista un logo de Pyero.workz.
- Conectar el repositorio (github.com/jeanqe16-ux/pyero-portafolio, público) a Pages CMS y desplegarlo en Cloudflare Workers con `wrangler.jsonc` (comando de build `npm run build`; límite de 25 MB por archivo).
- Los efectos hover y la reproducción de videos no se han probado con contenido real.
