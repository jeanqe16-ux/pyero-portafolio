// Transición entre páginas (cambio de idioma): un barrido de pixeles con la paleta, sobre las View Transitions de Astro.
// La página saliente se cubre mientras se descarga la nueva, y la nueva se descubre al quedar lista. Unos 0.45 s en total.
const PALETA = ['#fb8e1f', '#fb8e1f', '#fdaf50', '#ffd166', '#ff7a59', '#0a0a0a', '#ffffff'];
const DURACION = 220;
const reducir = window.matchMedia('(prefers-reduced-motion: reduce)');

let lienzo: HTMLCanvasElement | null = null;
let celdas: { x: number; y: number; turno: number; color: string }[] = [];
let lado = 0;

function preparar() {
  lienzo = document.createElement('canvas');
  lienzo.width = window.innerWidth;
  lienzo.height = window.innerHeight;
  lienzo.setAttribute('aria-hidden', 'true');
  lienzo.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:99;pointer-events:none';
  // Cuelga de <html>, fuera de <body>, para sobrevivir al reemplazo de la página
  document.documentElement.append(lienzo);

  lado = Math.ceil(Math.max(lienzo.width, lienzo.height) / 16);
  const columnas = Math.ceil(lienzo.width / lado);
  const filas = Math.ceil(lienzo.height / lado);
  celdas = [];
  for (let f = 0; f < filas; f++)
    for (let c = 0; c < columnas; c++)
      // El turno avanza de izquierda a derecha, con algo de azar para que el borde sea irregular
      celdas.push({ x: c * lado, y: f * lado, turno: (c / columnas) * 0.65 + Math.random() * 0.35, color: PALETA[Math.floor(Math.random() * PALETA.length)] });
}

const animar = (pintar: (avance: number) => void) =>
  new Promise<void>((listo) => {
    const inicio = performance.now();
    const paso = (ahora: number) => {
      const avance = Math.min(1, (ahora - inicio) / DURACION);
      pintar(avance);
      if (avance < 1) requestAnimationFrame(paso);
      else listo();
    };
    requestAnimationFrame(paso);
  });

function cubrir() {
  preparar();
  const ctx = lienzo!.getContext('2d')!;
  return animar((avance) => {
    for (const celda of celdas) {
      if (celda.turno > avance) continue;
      ctx.fillStyle = celda.color;
      ctx.fillRect(celda.x, celda.y, lado, lado);
    }
  });
}

async function descubrir() {
  if (!lienzo) return;
  const saliente = lienzo;
  const ctx = saliente.getContext('2d')!;
  lienzo = null;
  await animar((avance) => {
    for (const celda of celdas) if (celda.turno <= avance) ctx.clearRect(celda.x, celda.y, lado, lado);
  });
  saliente.remove();
}

document.addEventListener('astro:before-preparation', (evento) => {
  if (reducir.matches) return;
  // La descarga de la página nueva y el barrido corren a la vez; el cambio espera a los dos
  const descargar = evento.loader;
  evento.loader = async () => {
    await Promise.all([cubrir(), descargar()]);
  };
});

document.addEventListener('astro:after-swap', () => {
  // Al cambiar de página se pierden las clases de <html>: se repone la que activa la entrada de las secciones
  if (!reducir.matches && 'IntersectionObserver' in window) document.documentElement.classList.add('animar');
  descubrir();
});
