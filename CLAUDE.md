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
    textos.json      Textos de todas las secciones, en `es` y `en`
    cifras.json      Las tres cifras de trabajo (prefijo, valor y texto)
    casos.json       Casos de estudio: reto, lo que hice, resultado y videos
    proceso.json     Los tres pasos del proceso
    clientes.json    Clientes (id, nombre, logo) para la franja y los filtros
    diseno.json      Posts (una o varias imágenes) y portadas por cliente; se muestran dentro de cada caso
    creadores.json   Handles, enlaces y reels de creadores
    servicios.json   Copy, icono y video de cada servicio
    herramientas.json  Nombre, sigla y colores de cada herramienta
  layouts/Base.astro   <head>, SEO, header, footer, WhatsApp flotante, animación de entrada
  components/        Inicio (arma la página), Imagen (picture con srcset), Hero, Prueba, Franja, Casos, Servicios, Proceso, Sobre, Herramientas, Contacto, Redes
  pages/index.astro, pages/en/index.astro   Solo llaman a Inicio con su idioma
  pages/sitemap.xml.ts, pages/robots.txt.ts   Generados en el build a partir de la url del sitio
  pages/404.astro    Página 404 con mini juego de pixeles; una sola para ambos idiomas (pasa a inglés si la dirección empieza con /en/)
  styles/global.css  Variables, base, botones, navegación
  lib/enlaces.ts     Enlace de WhatsApp e iconos SVG compartidos
  lib/i18n.ts        textosDe(lang), tr(objeto, campo, lang) y ruta(lang)
  lib/imagenes.ts    optimizar(ruta, ancho) y conjunto(ruta, anchos, formato) sobre las imágenes de src/media
  lib/reels.ts       Reels del hero y sus tamaños, compartidos con la precarga del <head>
  media/<cliente>/   posts/, portadas/ y portadas de video (videos/*.webp), más yo.jpg: imágenes que Astro optimiza
  scripts/pixeles.ts Animaciones con GSAP ScrollTrigger (textos .pixel, fondo y línea del proceso); se carga diferido
  scripts/interacciones.ts   Cursor de pixel, botones magnéticos, decodificación de títulos y easter egg; se carga diferido
  scripts/barrido.ts Barrido de pixeles al cambiar de página, sobre las View Transitions de Astro
public/media/<cliente>/   logo.png y videos/*.mp4 (se sirven tal cual; ruta pública /media/...)
public/media/creadores/videos/   Reels de creadores
public/media/servicios/   Loops cuadrados de las tarjetas de Servicios
public/fonts/             Silkscreen autoalojada
public/og.png, og-en.png  Imágenes al compartir (1200x630), una por idioma
public/favicon.*, icon-*.png, apple-touch-icon.png, site.webmanifest   Iconos del sitio
scripts/generar-loops.sh   Regenera esos loops con ffmpeg desde el material fuente
scripts/generar-og.mjs     Regenera og.png y og-en.png con el titular del hero (usa Edge headless)
.pages.yml           Configuración de Pages CMS sobre los JSON de src/data
wrangler.jsonc       Despliegue en Cloudflare Workers: sirve ./dist como assets estáticos
```

Orden de secciones (cuenta una historia orientada a resultados): Hero (titular con iconos dentro del texto) → Prueba (cifras) → franja negra de marcas → Casos de estudio → Servicios → Proceso → Sobre mí → Cierre. No hay sección de Filosofía ni de Diseño gráfico: se eliminaron a pedido.

## Decisiones tomadas

- **Contenido en JSON, no en `.ts` ni en colecciones de contenido**: debe poder editarse desde Pages CMS. Cada lista va envuelta en un objeto (`{ "proyectos": [...] }`). Al agregar un campo a un JSON, agregarlo también en `.pages.yml`.
- **Ningún texto visible va escrito en los componentes**: sale de `src/data/`.
- **Marca**: Pyero.workz (no Pyero.visualz). Redes: instagram.com/pyero.workz y tiktok.com/@pyero.workz.
- **Dos idiomas**: español e inglés con selector ES/EN en el encabezado. Los textos de sección van en `textos.json` bajo `es` y `en`; en los demás JSON el inglés va en campos con sufijo `_en` (si falta, se usa el español). Todo componente recibe `lang`. Los títulos de posts y portadas no se traducen.
- **Sin testimonios ni cifras inventadas**: los resultados de los casos son cualitativos. Las cifras de trabajo (+15 proyectos, +5 marcas, 2 años) las dio el usuario; si `valor` queda vacío se muestra el marcador de `textos.json > prueba.pendiente`.
- **Casos**: cada caso tiene un espacio principal (4:5) y una columna de miniaturas a la derecha, desplazable si son muchas (fila deslizable en celular). Las miniaturas son sus videos de `casos.json` y luego los posts y portadas de ese cliente en `diseno.json`; al hacer clic la pieza se muestra en el espacio principal, sin recortarse.
- **Librerías**: solo `@fontsource-variable/inter` y `gsap` (con ScrollTrigger, pedido expresamente para las animaciones de pixeles). El resto de animaciones e interacciones va en CSS y JS propio; no agregar más sin que se pida.
- **Colores**: `--acento` (#FB8E1F) solo para palabras de titulares y elementos grandes o decorativos; `--acento-texto` (#B45309) para todo texto pequeño en naranja sobre fondo claro (cumple WCAG AA); `--acento-suave` (#FDAF50) solo sobre fondo negro.
- **Hover**: siempre dentro de `@media (hover: hover) and (pointer: fine)`.
- **Movimiento**: toda animación respeta `prefers-reduced-motion`.
- **Titulares con palabra en naranja**: se arman con `{' '}` explícito entre las partes para que no se peguen las palabras.
- **Enlaces externos**: `target="_blank"` con `rel="noopener noreferrer"`.
- **Textos del sitio**: sin emojis ni guiones largos.
- **Videos**: reels verticales 1080x1920 (hero y páginas de proyecto) y cuadrados 1080x1080 (servicios). Si el campo `video` está vacío se muestra "Próximamente".
- **Material fuente**: `videos-originales/` y `material-original/` están en `.gitignore`; solo se versiona lo optimizado en `public/media/`.
- **Medios**: videos en H.264 con `+faststart` (máximo 1080p, idealmente menos de 10 MB) en `public/media`; imágenes fuente en WebP de máximo 1600 px en `src/media`; logos en PNG blanco transparente en `public/media`.
- **Clientes**: el `id` de `clientes.json` es el nombre de su carpeta en `src/media/` y `public/media/` y el valor de `cliente` en `diseno.json` y `casos.json`.
- **Sin páginas de proyecto**: se reemplazaron por los casos de estudio en la portada. Los logos de la franja enlazan a `#caso-<id>` y el primer video de cada caso es su reel en el hero.
- **Franja**: el loop nunca se pausa. Los logos se pintan con `mask` para poder teñirlos de naranja al pasar el mouse.
- **Tarjetas de Servicios**: `media: "video"` reproduce un loop pregenerado (720x720, sin audio) que solo se descarga cuando la tarjeta entra en pantalla; `media: "posts"` muestra un pase con disolución de los posts de `diseno.json`. Si cambian los videos fuente, volver a correr `bash scripts/generar-loops.sh`.
- **Pixeles**: lienzos `canvas` movidos por el scroll con `scrub` (solo se repintan al hacer scroll, tope de 60 fps). Los textos con clase `.pixel` (nombre del hero y las tres cifras) llevan tres capas definidas en `global.css`: un lienzo de celdas de colores, una máscara en `mix-blend-mode: screen` que lo recorta a la forma de las letras y el texto encima; `rellenar()` en `scripts/pixeles.ts` los llena al bajar y los vacía al subir. El fondo es un lienzo fijo con `z-index: -1`, opacidad máxima 0.25, que forma las palabras de `textos.json > pixeles` (letras A-Z de 5x7, sin tildes) repartidas a lo largo de la página. 240 pixeles en escritorio, 120 en celular, y la mitad si pintar sale caro. Con `prefers-reduced-motion` no se activa nada y las cifras quedan como texto negro normal.
- **Espaciado**: las secciones usan `clamp(4rem, 7.5vw, 6rem)` de relleno vertical (64 px en celular, 96 px en escritorio) y unos 2rem entre titular y contenido. Mantenerlo compacto.
- **SEO y compartir**: la dirección pública vive en `site.json > url` (hoy `https://pyero-portafolio.jeanqe16.workers.dev`); de ahí salen canonical, hreflang, Open Graph, Twitter, sitemap y robots. Si cambia el dominio, basta con editar ese campo. `Base.astro` incluye los datos estructurados (`ProfessionalService` con su `Person`, en Huancayo, Perú). Las imágenes og llevan el titular del hero: si cambia el titular, hay que regenerarlas con `node scripts/generar-og.mjs`.
- **Imágenes**: las de `src/media` se nombran en los JSON por su ruta pública (`/media/...`) y `lib/imagenes.ts` las resuelve y optimiza en el build. `Imagen.astro` genera `<picture>` con AVIF y WebP en varios anchos; para una sola URL (miniaturas de 160 px, portadas de video de 640 px, imágenes grandes de 900 px) se usa `optimizar()`. Una ruta que no exista en `src/media` se usa tal cual, sin optimizar. Los estilos de un `<img>` que sale de `Imagen.astro` necesitan `:global(img)` en el componente padre.
- **Rendimiento (LCP)**: el elemento LCP en celular es la portada del primer reel: va con `loading="eager"`, `fetchpriority="high"` y precarga en el `<head>` (mismo srcset AVIF, calculado en `Inicio.astro`). El segundo reel también es `eager`; todo lo demás es `lazy`. En los reels la portada es una imagen y el video va encima, sin atributo `poster`. Todo el CSS va dentro del HTML (`build.inlineStylesheets: 'always'`). Sin fuentes externas: Inter por fontsource y Silkscreen en `public/fonts`, ambas precargadas y con `font-display: swap`. GSAP no está en la carga inicial: `Base.astro` importa `scripts/pixeles.ts` al primer scroll, toque o tecla, o cuando el navegador queda libre. Todo video usa `preload="none"`. La máscara de los textos `.pixel` se pinta desde el inicio a propósito: si apareciera al cargar el script, pasaría a ser el LCP en escritorio.
- **Favicon**: no hay un logo propio de Pyero.workz; los iconos salen de la marca provisional (cuadro negro con triángulo naranja de `favicon.svg`).
- **View Transitions**: `Base.astro` usa `<ClientRouter />`, así que al cambiar de idioma la página no se recarga. Por eso todo script de componente va dentro de `document.addEventListener('astro:page-load', ...)`, y los módulos diferidos exportan `iniciar()`, que `Base.astro` vuelve a llamar tras cada cambio de página (limpian lo anterior antes de empezar). La animación por defecto está desactivada (`transition:animate="none"`); el barrido lo pinta `scripts/barrido.ts` en un lienzo colgado de `<html>` para que sobreviva al reemplazo del `<body>`.
- **Interacciones** (todas se desactivan con `prefers-reduced-motion`; cursor y botones magnéticos solo con mouse): el cursor es un seguidor, no reemplaza al cursor del sistema, y muestra "Play" sobre videos y "Ver" sobre el visor de un caso. La decodificación se aplica a los `h2` de `main`, una vez, con el texto real en el HTML y en `aria-label` mientras dura. El easter egg se dispara al teclear "pyero".
- **Icono del hero**: el primer chip del titular recorre YouTube, TikTok, Instagram, Facebook y LinkedIn con animación CSS (10 s el ciclo). El chip no cambia de tamaño para no mover el texto.
- **Nombres de clase**: `.pie` es el footer global y `.redes` el grupo de iconos sociales; no reutilizarlos dentro de componentes.
- **Git**: un commit por fase. Los commits usan el correo privado de GitHub (noreply), configurado solo en este repositorio; no publicar el correo personal. `referencias/` está en `.gitignore` y fuera del historial. La rama `respaldo-local-sin-publicar` conserva el historial anterior y no debe subirse.

## Pendientes

- Fase 3: icono de YouTube con contador de vistas en "Eleva tu contenido" (sube al acercar el cursor, conteo único en táctil).
- Fase 4: franja pequeña de logos en gris ("Elevando tu marca"), con datos en `src/data/marcas.json`.
- Revisar la redacción de los casos de estudio y la traducción al inglés.
- Los tres videos de CERO están sin audio; confirmar cuál era el que no tenía sound design y restaurar el audio de los otros.
- Confirmar los handles de redes y agregar los enlaces de @Loreimp y @Basee44 en `creadores.json`.
- Si se conecta un dominio propio, actualizar `site.json > url`.
- Reemplazar el favicon provisional cuando exista un logo de Pyero.workz.
- Conectar el repositorio (github.com/jeanqe16-ux/pyero-portafolio, público) a Pages CMS y desplegarlo en Cloudflare Workers con `wrangler.jsonc` (comando de build `npm run build`; límite de 25 MB por archivo).
- Los efectos hover y la reproducción de videos no se han probado con contenido real.
