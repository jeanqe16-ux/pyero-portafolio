# Portafolio Pyero.workz

Portafolio de una sola página (más páginas de proyecto) para Pyero.workz: diseñador gráfico, editor de video y motion graphics. Sitio estático en Astro 7, solo en español. El brief original está en `brief.md` y las referencias visuales en `referencias/`.

## Comandos

- `npm run dev`: servidor de desarrollo en http://localhost:4321/
- `npm run build`: genera `dist/`
- Si tras cambios grandes el servidor muestra estilos rotos, reiniciarlo antes de buscar un fallo en el código (ya pasó una vez por caché).

## Estructura

```
src/
  data/            Todo el contenido editable (JSON)
    site.json        Marca, WhatsApp, redes, SEO
    textos.json      Textos de todas las secciones
    proyectos.json   Marcas con página propia y sus videos
    clientes.json    Clientes (id, nombre, logo) para la franja y los filtros
    diseno.json      Posts (una o varias imágenes) y portadas por cliente
    creadores.json   Handles, enlaces y reels de creadores
    servicios.json   Copy, icono y video de cada servicio
    herramientas.json  Nombre, sigla y colores de cada herramienta
  layouts/Base.astro   <head>, SEO, header, footer, WhatsApp flotante, animación de entrada
  components/        Hero, Franja, Diseno, Servicios, Sobre, Herramientas, Contacto, Redes
  pages/index.astro
  pages/proyectos/[slug].astro   Plantilla única por marca
  styles/global.css  Variables, base, botones, navegación
  lib/enlaces.ts     Enlace de WhatsApp e iconos SVG compartidos
  assets/            Foto de "Sobre mí" (foto-pyero.jpg|png|webp|avif)
public/media/<cliente>/   logo.png, videos/, posts/, portadas/ (ruta pública /media/...)
public/media/creadores/videos/   Reels de creadores
public/media/servicios/   Loops cuadrados de las tarjetas de Servicios
scripts/generar-loops.sh   Regenera esos loops con ffmpeg desde el material fuente
.pages.yml           Configuración de Pages CMS sobre los JSON de src/data
```

Orden de secciones en la portada: Hero (reels en abanico) → franja negra de marcas → Diseño gráfico (posts en tarjetas con filtro por empresa, portadas en carrusel continuo, visor) → Servicios → Sobre mí (con herramientas) → Contacto.

## Decisiones tomadas

- **Contenido en JSON, no en `.ts` ni en colecciones de contenido**: debe poder editarse desde Pages CMS. Cada lista va envuelta en un objeto (`{ "proyectos": [...] }`). Al agregar un campo a un JSON, agregarlo también en `.pages.yml`.
- **Ningún texto visible va escrito en los componentes**: sale de `src/data/`.
- **Marca**: Pyero.workz (no Pyero.visualz). Redes: instagram.com/pyero.workz y tiktok.com/@pyero.workz.
- **Solo español**: se eliminó la versión en inglés y el selector de idioma.
- **Sin librerías nuevas**: la única dependencia añadida es `@fontsource-variable/inter`. Animaciones e interacciones en CSS y JS propio.
- **Colores**: `--acento` (#FB8E1F) solo para palabras de titulares y elementos grandes o decorativos; `--acento-texto` (#B45309) para todo texto pequeño en naranja sobre fondo claro (cumple WCAG AA); `--acento-suave` (#FDAF50) solo sobre fondo negro.
- **Hover**: siempre dentro de `@media (hover: hover) and (pointer: fine)`.
- **Movimiento**: toda animación respeta `prefers-reduced-motion`.
- **Titulares con palabra en naranja**: se arman con `{' '}` explícito entre las partes para que no se peguen las palabras.
- **Enlaces externos**: `target="_blank"` con `rel="noopener noreferrer"`.
- **Textos del sitio**: sin emojis ni guiones largos.
- **Videos**: reels verticales 1080x1920 (hero y páginas de proyecto) y cuadrados 1080x1080 (servicios). Si el campo `video` está vacío se muestra "Próximamente".
- **Material fuente**: `videos-originales/` y `material-original/` están en `.gitignore`; solo se versiona lo optimizado en `public/media/`.
- **Medios**: videos en H.264 con `+faststart` (máximo 1080p, idealmente menos de 10 MB), imágenes en WebP de máximo 1600 px, logos en PNG blanco transparente.
- **Clientes**: el `id` de `clientes.json` es el nombre de su carpeta en `public/media/`, el valor de `cliente` en `diseno.json` y, si tiene página, el `slug` en `proyectos.json`. Clínica Zárate y Alpacart no tienen página de proyecto.
- **Sin sección "Videos por marca"**: se eliminó; las páginas `/proyectos/[slug]` siguen existiendo y se llega a ellas desde los logos de la franja. Los enlaces "Ver proyectos" y "Volver" apuntan a `#reels` (los reels del hero).
- **Franja**: el loop nunca se pausa. Los logos se pintan con `mask` para poder teñirlos de naranja al pasar el mouse.
- **Tarjetas de Servicios**: `media: "video"` reproduce un loop pregenerado (720x720, sin audio) que solo se descarga cuando la tarjeta entra en pantalla; `media: "posts"` muestra un pase con disolución de los posts de `diseno.json`. Si cambian los videos fuente, volver a correr `bash scripts/generar-loops.sh`.
- **Posts**: tarjetas verticales 4:5 (la imagen cuadrada se recorta a los lados; completa se ve en el visor). Sin botón "Todos": se muestra por defecto la primera empresa de `clientes.json` que tenga posts. Un post con varias rutas en `imagenes` lleva un contador y el visor recorre todas.
- **Portadas**: un solo carrusel sin filtros que avanza solo de izquierda a derecha (18 px/s, 5 px/s con el mouse encima, nunca se detiene), con flechas y deslizado táctil. Se anima con `requestAnimationFrame` sobre `scrollLeft` y tres tandas idénticas.
- **Nombres de clase**: `.pie` es el footer global; no reutilizarlo dentro de componentes.
- **Git**: un commit por fase. Identidad configurada solo en este repositorio.

## Pendientes

- Fase 3: icono de YouTube con contador de vistas en "Eleva tu contenido" (sube al acercar el cursor, conteo único en táctil).
- Fase 4: franja pequeña de logos en gris ("Elevando tu marca"), con datos en `src/data/marcas.json`.
- Subir la foto a `src/assets/foto-pyero.jpg`.
- Los tres videos de CERO están sin audio; confirmar cuál era el que no tenía sound design y restaurar el audio de los otros.
- Confirmar los handles de redes y agregar los enlaces de @Loreimp y @Basee44 en `creadores.json`.
- Definir `site` en `astro.config.mjs` cuando haya dominio, para que las URL de Open Graph salgan absolutas.
- Subir el repositorio a GitHub y conectarlo a Pages CMS.
- Silkscreen (fuente bit del nombre) aún se carga desde Google Fonts; autoalojarla si se quiere evitar la dependencia externa.
- Los efectos hover y la reproducción de videos no se han probado con contenido real.
