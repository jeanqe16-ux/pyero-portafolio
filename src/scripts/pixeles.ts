// Animaciones de pixeles ligadas al scroll: relleno del nombre del hero y pixeles de fondo que forman palabras
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const PALETA = ['#fb8e1f', '#fb8e1f', '#fdaf50', '#ffd166', '#ff7a59', '#0a0a0a'];
const movil = window.matchMedia('(max-width: 820px)').matches;
const escala = Math.min(window.devicePixelRatio || 1, movil ? 1.5 : 2);

// Letras de 5x7; cada fila es un número binario de 5 bits
const LETRAS: Record<string, number[]> = {
  A: [14, 17, 17, 31, 17, 17, 17],
  B: [30, 17, 17, 30, 17, 17, 30],
  C: [14, 17, 16, 16, 16, 17, 14],
  D: [30, 17, 17, 17, 17, 17, 30],
  E: [31, 16, 16, 30, 16, 16, 31],
  F: [31, 16, 16, 30, 16, 16, 16],
  G: [14, 17, 16, 23, 17, 17, 14],
  H: [17, 17, 17, 31, 17, 17, 17],
  I: [31, 4, 4, 4, 4, 4, 31],
  J: [7, 2, 2, 2, 2, 18, 12],
  K: [17, 18, 20, 24, 20, 18, 17],
  L: [16, 16, 16, 16, 16, 16, 31],
  M: [17, 27, 21, 21, 17, 17, 17],
  N: [17, 25, 21, 19, 17, 17, 17],
  O: [14, 17, 17, 17, 17, 17, 14],
  P: [30, 17, 17, 30, 16, 16, 16],
  Q: [14, 17, 17, 17, 21, 18, 13],
  R: [30, 17, 17, 30, 20, 18, 17],
  S: [15, 16, 16, 14, 1, 1, 30],
  T: [31, 4, 4, 4, 4, 4, 4],
  U: [17, 17, 17, 17, 17, 17, 14],
  V: [17, 17, 17, 17, 17, 10, 4],
  W: [17, 17, 17, 21, 21, 27, 17],
  X: [17, 17, 10, 4, 10, 17, 17],
  Y: [17, 17, 10, 4, 4, 4, 4],
  Z: [31, 1, 2, 4, 8, 16, 31],
};

const mezclar = <T,>(lista: T[]) => {
  for (let i = lista.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [lista[i], lista[j]] = [lista[j], lista[i]];
  }
  return lista;
};
const suave = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/* Nombre del hero: se rellena pixel a pixel, en orden aleatorio, según el scroll */
function nombre() {
  const caja = document.querySelector<HTMLElement>('.bit');
  const lienzo = caja?.querySelector<HTMLCanvasElement>('.bit-lienzo');
  const ctx = lienzo?.getContext('2d');
  if (!caja || !lienzo || !ctx) return;

  const estado = { lleno: 0 };
  let lado = 0;
  let columnas = 0;
  let celdas: { orden: number; color: string }[] = [];

  const pintar = () => {
    // El blanco es lo que la máscara deja ver dentro de las letras vacías
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, lienzo.width, lienzo.height);
    const hasta = estado.lleno * celdas.length;
    for (let i = 0; i < celdas.length; i++) {
      if (celdas[i].orden >= hasta) continue;
      ctx.fillStyle = celdas[i].color;
      ctx.fillRect((i % columnas) * lado, Math.floor(i / columnas) * lado, lado, lado);
    }
    caja.style.setProperty('--lleno', estado.lleno.toFixed(3));
  };

  const armar = () => {
    const ancho = caja.clientWidth;
    const alto = caja.clientHeight;
    if (!ancho || !alto) return;
    lienzo.width = Math.round(ancho * escala);
    lienzo.height = Math.round(alto * escala);
    lado = Math.max(4, Math.round(alto / 13)) * escala;
    columnas = Math.ceil(lienzo.width / lado);
    const total = columnas * Math.ceil(lienzo.height / lado);
    const orden = mezclar(Array.from({ length: total }, (_, i) => i));
    celdas = orden.map((o) => ({ orden: o, color: PALETA[Math.floor(Math.random() * PALETA.length)] }));
    pintar();
  };

  caja.classList.add('activo');
  armar();
  new ResizeObserver(armar).observe(caja);

  gsap.to(estado, {
    lleno: 1,
    ease: 'none',
    onUpdate: pintar,
    scrollTrigger: { trigger: caja, start: 'clamp(top 62%)', end: 'top 12%', scrub: 0.4 },
  });
}

/* Fondo: pixeles repartidos que cambian con el scroll y por momentos se agrupan en palabras */
function fondo() {
  const lienzo = document.querySelector<HTMLCanvasElement>('.fondo-pixeles');
  const ctx = lienzo?.getContext('2d');
  if (!lienzo || !ctx) return;

  const palabras: string[] = JSON.parse(lienzo.dataset.palabras || '[]').map((p: string) => p.toUpperCase());
  const colores = PALETA.slice(0, 5); // el negro solo se usa en el nombre, aquí restaría legibilidad
  let cantidad = movil ? 120 : 240;
  const estado = { avance: 0 };
  let ancho = 0;
  let alto = 0;
  let destinos: { x: number; y: number; lado: number }[][] = [];

  const pixeles = Array.from({ length: cantidad }, () => ({
    x: Math.random(),
    y: Math.random(),
    lado: (movil ? 5 : 6) + Math.floor(Math.random() * 3) * 2,
    color: Math.floor(Math.random() * colores.length),
    fase: Math.random() * Math.PI * 2,
    ritmo: 0.6 + Math.random() * 1.4,
  }));

  // Posición en pantalla de cada pixel de cada palabra, centrada y a un tamaño que entre en el ancho
  const medir = () => {
    ancho = window.innerWidth;
    alto = window.innerHeight;
    lienzo.width = Math.round(ancho * escala);
    lienzo.height = Math.round(alto * escala);
    destinos = palabras.map((palabra, n) => {
      const columnas = palabra.length * 6 - 1;
      const paso = Math.max(8, Math.min(30, Math.floor((ancho * (movil ? 0.86 : 0.6)) / columnas)));
      const x0 = Math.round((ancho - columnas * paso) / 2);
      // Alternan arriba y abajo del texto de la sección para no quedar detrás de él
      const y0 = Math.round(alto * (n % 2 ? 0.82 : 0.2) - 3.5 * paso);
      const puntos: { x: number; y: number; lado: number }[] = [];
      [...palabra].forEach((letra, l) =>
        (LETRAS[letra] ?? []).forEach((fila, f) => {
          for (let c = 0; c < 5; c++)
            if (fila & (16 >> c)) puntos.push({ x: x0 + (l * 6 + c) * paso, y: y0 + f * paso, lado: Math.round(paso * 0.8) });
        }),
      );
      return mezclar(puntos);
    });
  };

  // Las palabras se forman mientras se recorre la sección de filosofía, que queda fija en pantalla
  const seccion = document.querySelector<HTMLElement>('.filosofia');
  const tramo = { t: 0 };

  let costo = 0;
  let muestras = 0;

  const pintar = () => {
    const inicio = performance.now();
    const p = estado.avance;
    ctx.setTransform(escala, 0, 0, escala, 0, 0);
    ctx.clearRect(0, 0, ancho, alto);

    // Cada palabra ocupa un tramo de la sección: se arma, se sostiene y se deshace
    let palabra = -1;
    let fuerza = 0;
    for (let n = 0; n < destinos.length; n++) {
      const centro = 0.08 + (0.84 * (n + 0.5)) / destinos.length;
      const f = seccion ? 1 - suave(0.045, 0.08, Math.abs(tramo.t - centro)) : 0;
      if (f > fuerza) [palabra, fuerza] = [n, f];
    }
    const puntos = palabra >= 0 ? destinos[palabra] : [];

    for (let i = 0; i < cantidad; i++) {
      const px = pixeles[i];
      const onda = 0.5 + 0.5 * Math.sin(px.fase + p * 40 * px.ritmo);
      let x = px.x * ancho;
      // Los sueltos derivan un poco hacia arriba al bajar, como una capa más lejana
      let y = (((px.y - p * 0.6 * px.ritmo) % 1) + 1) % 1 * alto;
      let lado = px.lado;
      let opacidad = 0.05 + 0.13 * onda;
      const destino = puntos[i];
      if (destino && fuerza > 0) {
        x += (destino.x - x) * fuerza;
        y += (destino.y - y) * fuerza;
        lado += (destino.lado - lado) * fuerza;
        opacidad += (0.25 - opacidad) * fuerza;
      } else {
        opacidad *= 1 - 0.45 * fuerza;
      }
      ctx.globalAlpha = Math.min(0.25, opacidad);
      ctx.fillStyle = colores[(px.color + Math.floor(p * 9 * px.ritmo)) % colores.length];
      ctx.fillRect(Math.round(x), Math.round(y), lado, lado);
    }

    // Si pintar sale caro, se queda con la mitad de pixeles (sin bajar de los que necesita la palabra más larga)
    costo += performance.now() - inicio;
    if (++muestras === 40) {
      const minimo = Math.max(60, ...destinos.map((d) => d.length));
      if (costo / muestras > 5 && cantidad > minimo) cantidad = Math.max(minimo, Math.round(cantidad / 2));
      costo = muestras = 0;
    }
  };

  medir();
  pintar();
  window.addEventListener('resize', () => {
    medir();
    pintar();
  });

  gsap.to(estado, {
    avance: 1,
    ease: 'none',
    onUpdate: pintar,
    scrollTrigger: { start: 0, end: 'max', scrub: 0.6 },
  });

  if (seccion)
    gsap.to(tramo, {
      t: 1,
      ease: 'none',
      onUpdate: pintar,
      scrollTrigger: { trigger: seccion, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
    });
}

// Con "reducir movimiento" no se activa nada: el nombre queda en contorno y el fondo vacío
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  // Marca la página para que la sección de filosofía se alargue solo cuando hay animación
  document.documentElement.classList.add('con-pixeles');
  gsap.registerPlugin(ScrollTrigger);
  gsap.ticker.fps(60);
  fondo();
  document.fonts.ready.then(() => {
    nombre();
    ScrollTrigger.refresh();
  });
}
