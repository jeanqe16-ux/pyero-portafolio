// Utilidades de animación: escena ligada al scroll (la sección mide varias pantallas, su interior queda fijo
// y pintar(p) dibuja el estado según el avance p, de 0 a 1; GSAP se pide solo cuando la escena se acerca),
// cursores con nombre y el saltito de los cambios de imagen.

export type Punto = { x: number; y: number };

export function montarEscena(seccion: HTMLElement, pintar: (p: number) => void): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    seccion.classList.add('estatica');
    pintar(1);
    return () => {};
  }
  pintar(0);
  let vivo = true;
  let matar: (() => void) | null = null;
  const cerca = new IntersectionObserver(
    async ([entrada]) => {
      if (!entrada.isIntersecting) return;
      cerca.disconnect();
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
      if (!vivo) return;
      gsap.registerPlugin(ScrollTrigger);
      const estado = { p: 0 };
      const tween = gsap.to(estado, {
        p: 1,
        ease: 'none',
        onUpdate: () => pintar(estado.p),
        scrollTrigger: { trigger: seccion, start: 'top top', end: 'bottom bottom', scrub: 0.5 },
      });
      matar = () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { rootMargin: '120% 0px' },
  );
  cerca.observe(seccion);
  return () => {
    vivo = false;
    cerca.disconnect();
    matar?.();
  };
}

/** Avance de p dentro del tramo [a, b], de 0 a 1. */
export const tramo = (p: number, a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));

/** Suaviza un avance de 0 a 1 (entra y sale despacio). */
export const suave = (x: number) => x * x * (3 - 2 * x);

/** Posición de un elemento dentro de otro (fx, fy: qué punto de su caja, de 0 a 1). */
export function punto(base: HTMLElement, el: Element, fx = 0.5, fy = 0.5): Punto {
  const b = base.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  return { x: r.left - b.left + r.width * fx, y: r.top - b.top + r.height * fy };
}

/** Corte seco con saltito: reinicia la animación .salto del elemento. */
export function salto(el: Element) {
  el.classList.remove('salto');
  void (el as HTMLElement).offsetWidth;
  el.classList.add('salto');
}

/** Mueve un cursor y marca el clic. */
export function moverCursor(cursor: HTMLElement, pos: Punto, clic = false) {
  cursor.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
  cursor.classList.toggle('clic', clic);
}
