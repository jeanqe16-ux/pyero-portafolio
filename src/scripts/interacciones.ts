// Detalles de interacción: botones magnéticos, títulos que se decodifican y el easter egg.
// Se carga de forma diferida desde Base.astro y nunca con "reducir movimiento".
const PALETA = ['#fb8e1f', '#fb8e1f', '#fdaf50', '#ffd166', '#ff7a59', '#0a0a0a'];
const conMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* Botones magnéticos: se acercan hasta 8 px al cursor cuando pasa cerca */
let imanes: { el: HTMLElement; x: number; y: number; radio: number; activo: boolean }[] = [];
const medirImanes = () => {
  imanes.forEach((iman) => {
    iman.el.style.translate = '';
    iman.activo = false;
    const caja = iman.el.getBoundingClientRect();
    iman.x = caja.left + caja.width / 2;
    iman.y = caja.top + caja.height / 2;
    iman.radio = Math.max(caja.width, caja.height) / 2 + 48;
  });
};
const atraer = (x: number, y: number) => {
  for (const iman of imanes) {
    const dx = x - iman.x;
    const dy = y - iman.y;
    if (Math.hypot(dx, dy) < iman.radio) {
      const limite = (v: number) => Math.max(-8, Math.min(8, v * 0.22));
      iman.el.style.translate = `${limite(dx).toFixed(1)}px ${limite(dy).toFixed(1)}px`;
      iman.activo = true;
    } else if (iman.activo) {
      iman.el.style.translate = '';
      iman.activo = false;
    }
  }
};

if (conMouse) {
  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType === 'mouse') atraer(e.clientX, e.clientY);
    },
    { passive: true },
  );

  // Las posiciones de los botones cambian al hacer scroll o redimensionar: se vuelven a medir al terminar
  let espera = 0;
  const remedir = () => {
    window.clearTimeout(espera);
    espera = window.setTimeout(medirImanes, 120);
  };
  window.addEventListener('scroll', remedir, { passive: true });
  window.addEventListener('resize', remedir);
}

/* Títulos de sección: caracteres aleatorios que se resuelven en 0.8 s al entrar en pantalla, una sola vez */
const SIMBOLOS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&<>/';
const alAzar = (letra: string) => {
  const simbolo = SIMBOLOS[Math.floor(Math.random() * SIMBOLOS.length)];
  // Las minúsculas se reemplazan por minúsculas para que el ancho del texto casi no cambie
  return letra === letra.toLowerCase() && letra !== letra.toUpperCase() ? simbolo.toLowerCase() : simbolo;
};

function decodificar(titulo: HTMLElement) {
  const nodos: Text[] = [];
  const recorrido = document.createTreeWalker(titulo, NodeFilter.SHOW_TEXT);
  while (recorrido.nextNode()) nodos.push(recorrido.currentNode as Text);
  const originales = nodos.map((nodo) => nodo.data);
  const total = originales.reduce((suma, texto) => suma + texto.length, 0);
  if (!total) return;

  // Mientras dura el efecto, los lectores de pantalla leen el texto real y el alto queda fijo
  titulo.setAttribute('aria-label', titulo.textContent!.replace(/\s+/g, ' ').trim());
  titulo.style.minHeight = `${titulo.offsetHeight}px`;
  const inicio = performance.now();

  const paso = (ahora: number) => {
    const avance = Math.min(1, (ahora - inicio) / 800);
    let n = 0;
    nodos.forEach((nodo, i) => {
      nodo.data = [...originales[i]].map((letra) => (n++ / total < avance || /\s/.test(letra) ? letra : alAzar(letra))).join('');
    });
    if (avance < 1 && titulo.isConnected) return requestAnimationFrame(paso);
    nodos.forEach((nodo, i) => (nodo.data = originales[i]));
    titulo.removeAttribute('aria-label');
    titulo.style.minHeight = '';
  };
  requestAnimationFrame(paso);
}

/* Easter egg: al escribir "pyero" estalla una nube de pixeles desde el centro */
function explosion() {
  const lienzo = document.createElement('canvas');
  const ancho = (lienzo.width = window.innerWidth);
  const alto = (lienzo.height = window.innerHeight);
  lienzo.setAttribute('aria-hidden', 'true');
  lienzo.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:95;pointer-events:none';
  document.documentElement.append(lienzo);
  const ctx = lienzo.getContext('2d')!;
  // En modo oscuro los pixeles negros no se verían: pasan a blanco
  const colores = document.documentElement.dataset.tema === 'oscuro' ? PALETA.map((c) => (c === '#0a0a0a' ? '#ffffff' : c)) : PALETA;

  const pixeles = Array.from({ length: 160 }, () => {
    const angulo = Math.random() * Math.PI * 2;
    const fuerza = 220 + Math.random() * Math.min(ancho, 900);
    return {
      x: ancho / 2,
      y: alto / 2,
      vx: Math.cos(angulo) * fuerza,
      vy: Math.sin(angulo) * fuerza - 220,
      lado: 6 + Math.floor(Math.random() * 4) * 5,
      color: colores[Math.floor(Math.random() * colores.length)],
    };
  });

  const DURACION = 1600;
  const inicio = performance.now();
  let anterior = inicio;
  const paso = (ahora: number) => {
    const dt = Math.min((ahora - anterior) / 1000, 0.05);
    anterior = ahora;
    const avance = (ahora - inicio) / DURACION;
    ctx.clearRect(0, 0, ancho, alto);
    ctx.globalAlpha = Math.max(0, 1 - avance * avance);
    for (const p of pixeles) {
      p.vy += 900 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.lado, p.lado);
    }
    if (avance < 1) requestAnimationFrame(paso);
    else lienzo.remove();
  };
  requestAnimationFrame(paso);
}

let tecleado = '';
window.addEventListener('keydown', (e) => {
  if (e.key.length !== 1) return;
  tecleado = (tecleado + e.key.toLowerCase()).slice(-5);
  if (tecleado === 'pyero') {
    tecleado = '';
    explosion();
  }
});

/* Se llama al cargar el módulo y de nuevo después de cada cambio de página */
let observador: IntersectionObserver | null = null;
export function iniciar() {
  imanes = conMouse ? [...document.querySelectorAll<HTMLElement>('.boton')].map((el) => ({ el, x: 0, y: 0, radio: 0, activo: false })) : [];
  medirImanes();

  observador?.disconnect();
  observador = new IntersectionObserver(
    (entradas) =>
      entradas.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        observador!.unobserve(target);
        decodificar(target as HTMLElement);
      }),
    { threshold: 0.6 },
  );
  document.querySelectorAll<HTMLElement>('main h2').forEach((titulo) => observador!.observe(titulo));
}
