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
    site.json        Marca, WhatsApp, redes, SEO
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
  components/        Inicio (arma la página), Hero, Prueba, Franja, Casos, Servicios, Proceso, Sobre, Herramientas, Contacto, Redes
  pages/index.astro, pages/en/index.astro   Solo llaman a Inicio con su idioma
  styles/global.css  Variables, base, botones, navegación
  lib/enlaces.ts     Enlace de WhatsApp e iconos SVG compartidos
  lib/i18n.ts        textosDe(lang), tr(objeto, campo, lang) y ruta(lang)
  scripts/pixeles.ts Animaciones de pixeles con GSAP ScrollTrigger (nombre del hero y fondo)
public/media/<cliente>/   logo.png, videos/, posts/, portadas/ (ruta pública /media/...)
public/media/yo.jpg       Foto de "Sobre mí" (también acepta jpeg, webp o png)
public/media/creadores/videos/   Reels de creadores
public/media/servicios/   Loops cuadrados de las tarjetas de Servicios
scripts/generar-loops.sh   Regenera esos loops con ffmpeg desde el material fuente
.pages.yml           Configuración de Pages CMS sobre los JSON de src/data
wrangler.jsonc       Despliegue en Cloudflare Workers: sirve ./dist como assets estáticos
```

Orden de secciones (cuenta una historia orientada a resultados): Hero → Prueba (cifras) → franja negra de marcas → Casos de estudio → Servicios → Proceso → Sobre mí → Cierre. No hay sección de Filosofía ni de Diseño gráfico: se eliminaron a pedido.

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
- **Medios**: videos en H.264 con `+faststart` (máximo 1080p, idealmente menos de 10 MB), imágenes en WebP de máximo 1600 px, logos en PNG blanco transparente.
- **Clientes**: el `id` de `clientes.json` es el nombre de su carpeta en `public/media/` y el valor de `cliente` en `diseno.json` y `casos.json`.
- **Sin páginas de proyecto**: se reemplazaron por los casos de estudio en la portada. Los logos de la franja enlazan a `#caso-<id>` y el primer video de cada caso es su reel en el hero.
- **Franja**: el loop nunca se pausa. Los logos se pintan con `mask` para poder teñirlos de naranja al pasar el mouse.
- **Tarjetas de Servicios**: `media: "video"` reproduce un loop pregenerado (720x720, sin audio) que solo se descarga cuando la tarjeta entra en pantalla; `media: "posts"` muestra un pase con disolución de los posts de `diseno.json`. Si cambian los videos fuente, volver a correr `bash scripts/generar-loops.sh`.
- **Pixeles**: lienzos `canvas` movidos por el scroll con `scrub` (solo se repintan al hacer scroll, tope de 60 fps). Los textos con clase `.pixel` (nombre del hero y las tres cifras) llevan tres capas definidas en `global.css`: un lienzo de celdas de colores, una máscara en `mix-blend-mode: screen` que lo recorta a la forma de las letras y el texto encima; `rellenar()` en `scripts/pixeles.ts` los llena al bajar y los vacía al subir. El fondo es un lienzo fijo con `z-index: -1`, opacidad máxima 0.25, que forma las palabras de `textos.json > pixeles` (letras A-Z de 5x7, sin tildes) repartidas a lo largo de la página. 240 pixeles en escritorio, 120 en celular, y la mitad si pintar sale caro. Con `prefers-reduced-motion` no se activa nada y las cifras quedan como texto negro normal.
- **Espaciado**: las secciones usan `clamp(4rem, 7.5vw, 6rem)` de relleno vertical (64 px en celular, 96 px en escritorio) y unos 2rem entre titular y contenido. Mantenerlo compacto.
- **Nombres de clase**: `.pie` es el footer global; no reutilizarlo dentro de componentes.
- **Git**: un commit por fase. Los commits usan el correo privado de GitHub (noreply), configurado solo en este repositorio; no publicar el correo personal. `referencias/` está en `.gitignore` y fuera del historial. La rama `respaldo-local-sin-publicar` conserva el historial anterior y no debe subirse.

## Pendientes

- Fase 3: icono de YouTube con contador de vistas en "Eleva tu contenido" (sube al acercar el cursor, conteo único en táctil).
- Fase 4: franja pequeña de logos en gris ("Elevando tu marca"), con datos en `src/data/marcas.json`.
- Revisar la redacción de los casos de estudio y la traducción al inglés.
- Los tres videos de CERO están sin audio; confirmar cuál era el que no tenía sound design y restaurar el audio de los otros.
- Confirmar los handles de redes y agregar los enlaces de @Loreimp y @Basee44 en `creadores.json`.
- Definir `site` en `astro.config.mjs` cuando haya dominio, para que las URL de Open Graph salgan absolutas.
- Conectar el repositorio (github.com/jeanqe16-ux/pyero-portafolio, público) a Pages CMS y desplegarlo en Cloudflare Workers con `wrangler.jsonc` (comando de build `npm run build`; límite de 25 MB por archivo).
- Silkscreen (fuente bit del nombre) aún se carga desde Google Fonts; autoalojarla si se quiere evitar la dependencia externa.
- Los efectos hover y la reproducción de videos no se han probado con contenido real.
