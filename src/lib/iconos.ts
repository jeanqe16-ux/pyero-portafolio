// Iconos de trazo (viewBox 0 0 24 24) para los cuadritos de las filas
export const iconos = {
  video: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/>',
  motion: '<path d="M4 18c4 0 4-12 8-12s4 12 8 12"/><circle cx="4" cy="18" r="1.6" fill="currentColor"/><circle cx="20" cy="18" r="1.6" fill="currentColor"/>',
  diseno: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  chispa: '<path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"/>',
  texto: '<path d="M5 6h14M12 6v13M9 19h6"/>',
} as const;

export type Icono = keyof typeof iconos;

/** SVG completo de un icono, para usar con set:html. */
export const svgIcono = (nombre: Icono) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconos[nombre]}</svg>`;
