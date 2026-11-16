// Motor común de las escenas ligadas al scroll: la sección mide varias pantallas, su interior queda fijo
// y una función pintar(p) dibuja el estado de la escena según el avance p, de 0 a 1.
// GSAP se pide solo cuando la escena se acerca; con "reducir movimiento" se pinta el final y no se fija nada.

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

export const mezclar = (a: Punto, b: Punto, k: number): Punto => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k });

/** Posición de un elemento dentro de otro (fx, fy: qué punto de su caja, de 0 a 1). */
export function punto(base: HTMLElement, el: Element, fx = 0.5, fy = 0.5): Punto {
  const b = base.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  return { x: r.left - b.left + r.width * fx, y: r.top - b.top + r.height * fy };
}

/**
 * Recorrido de un cursor: lista de [desde, hasta, punto]. Entre dos paradas espera en la anterior y viaja suavizado al final.
 * Antes de la primera y después de la última queda en el punto "fuera".
 */
export function recorrido(p: number, paradas: [number, number, Punto][], fuera: Punto): Punto {
  if (!paradas.length || p < paradas[0][0] - 0.06) return fuera;
  for (let i = 0; i < paradas.length; i++) {
    const [desde, hasta, destino] = paradas[i];
    const previo = i === 0 ? fuera : paradas[i - 1][2];
    const llegada = i === 0 ? desde - 0.06 : Math.max(paradas[i - 1][1], desde - 0.07);
    if (p < desde) return mezclar(previo, destino, suave(tramo(p, llegada, desde)));
    if (p <= hasta) return destino;
  }
  const ultima = paradas[paradas.length - 1];
  return mezclar(ultima[2], fuera, suave(tramo(p, ultima[1], ultima[1] + 0.06)));
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

/**
 * Escena que no detiene el scroll: mientras la sección está en pantalla, pintar(p) corre sola de 0 a 1
 * en `duracion` ms, espera `pausa` ms con el resultado y vuelve a empezar. Con "reducir movimiento" pinta el final.
 */
export function reproducirEnBucle(seccion: HTMLElement, pintar: (p: number) => void, duracion = 9000, pausa = 2500): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    seccion.classList.add('estatica');
    pintar(1);
    return () => {};
  }
  pintar(0);
  let cuadro = 0;
  let inicio = 0;
  let pausado = 0;
  const paso = (ahora: number) => {
    if (!inicio) inicio = ahora - pausado;
    const t = (ahora - inicio) % (duracion + pausa);
    pintar(Math.min(1, t / duracion));
    cuadro = requestAnimationFrame(paso);
  };
  const vista = new IntersectionObserver(([entrada]) => {
    if (entrada.isIntersecting && !cuadro) {
      cuadro = requestAnimationFrame(paso);
    } else if (!entrada.isIntersecting && cuadro) {
      cancelAnimationFrame(cuadro);
      pausado = performance.now() - inicio;
      inicio = 0;
      cuadro = 0;
    }
  });
  vista.observe(seccion);
  return () => {
    vista.disconnect();
    cancelAnimationFrame(cuadro);
  };
}
