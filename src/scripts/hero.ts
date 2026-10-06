// Hero: revelado de entrada con WebGL según el mapa de profundidad (de lejos a cerca, con un barrido de degradado),
// parallax leve con el mouse en escritorio y arranque del video en loop cuando la página ya cargó.
// La imagen del hero es un <img> normal que se pinta de inmediato (es el LCP); este módulo solo dibuja encima.

const VERTICES = `attribute vec2 p; varying vec2 v; void main() { v = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAGMENTOS = `precision mediump float;
varying vec2 v;
uniform sampler2D uImagen;
uniform sampler2D uProfundidad;
uniform vec2 uEscala;   // recorte tipo object-fit: cover
uniform vec2 uDesvio;   // equivalente a object-position
uniform vec2 uMouse;    // -1..1, suavizado
uniform float uAvance;  // 0 = todo cubierto, 1 = todo revelado
uniform vec3 uCubierta; // color que tapa lo que aún no se revela

void main() {
  vec2 uv = (vec2(v.x, 1.0 - v.y) - 0.5) * uEscala + 0.5 + uDesvio;
  float d = texture2D(uProfundidad, uv).r; // 0 lejos, 1 cerca
  // Parallax: lo cercano se desplaza más que lo lejano
  vec3 color = texture2D(uImagen, uv + uMouse * (d - 0.3) * 0.014).rgb;

  if (uAvance < 0.999) {
    // Orden de aparición: primero lo lejano; el cielo, que es todo "lejos", entra de arriba hacia abajo
    float orden = d * 0.78 + uv.y * 0.22;
    float frente = uAvance * 1.5 - 0.12;
    float k = clamp((orden - (frente - 0.32)) / 0.32, 0.0, 1.0);
    // Detrás del frente va el degradado de la paleta: crema, naranja y coral en el borde
    vec3 crema = vec3(1.0, 0.953, 0.878);
    vec3 naranja = vec3(0.984, 0.557, 0.122);
    vec3 coral = vec3(1.0, 0.478, 0.349);
    vec3 degradado = mix(mix(crema, naranja, smoothstep(0.0, 0.6, k)), coral, smoothstep(0.6, 1.0, k));
    color = mix(color, degradado, smoothstep(0.0, 0.85, k) * 0.92);
    color = mix(color, uCubierta, smoothstep(frente - 0.03, frente + 0.03, orden));
  }
  gl_FragColor = vec4(color, 1.0);
}`;

const DURACION = 1500;
// Mismo encuadre que el CSS: object-position: 50% 55%
const POSICION = { x: 0.5, y: 0.55 };

declare global {
  interface Window {
    __heroVisto?: boolean;
  }
}

const alCargar = (hacer: () => void) => {
  if (document.readyState === 'complete') hacer();
  else window.addEventListener('load', hacer, { once: true });
};

const imagen = (src: string) =>
  new Promise<HTMLImageElement>((listo, fallo) => {
    const img = new Image();
    img.onload = () => listo(img);
    img.onerror = fallo;
    img.src = src;
  });

async function iniciar(media: HTMLElement) {
  const raiz = document.documentElement;
  const foto = media.querySelector('img')!;
  const video = media.querySelector('video')!;
  const lienzo = media.querySelector('canvas')!;
  const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const conMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const movil = window.matchMedia('(max-width: 820px)').matches;

  // Quita la cubierta de CSS; a partir de aquí manda la imagen (o el lienzo)
  const listo = () => {
    window.__heroVisto = true;
    raiz.classList.add('hero-listo');
  };

  // El video se pide recién cuando la página terminó de cargar, para no competir con la imagen
  const empezarVideo = () =>
    alCargar(() => {
      video.poster = media.dataset.poster!;
      video.src = (movil && media.dataset.videoMovil) || media.dataset.video!;
      video.addEventListener('playing', () => media.classList.add('con-video'), { once: true });
      video.play().catch(() => {});
    });

  // Con "reducir movimiento" queda la foto fija: sin revelado, sin parallax y sin video en marcha
  if (reducir) return listo();

  const gl = lienzo.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' });
  let mapa: HTMLImageElement | null = null;
  if (gl) {
    try {
      // Si la foto o el mapa tardan demasiado, se sigue sin efecto en vez de dejar la pantalla cubierta
      const limite = new Promise<never>((_, fallo) => window.setTimeout(fallo, 2500));
      [mapa] = await Promise.race([Promise.all([imagen(media.dataset.profundidad!), foto.decode()]), limite]);
    } catch {
      mapa = null;
    }
  }
  if (!gl || !mapa || !lienzo.isConnected) {
    listo();
    return empezarVideo();
  }

  const compilar = (tipo: number, codigo: string) => {
    const sombreador = gl.createShader(tipo)!;
    gl.shaderSource(sombreador, codigo);
    gl.compileShader(sombreador);
    return sombreador;
  };
  const programa = gl.createProgram()!;
  gl.attachShader(programa, compilar(gl.VERTEX_SHADER, VERTICES));
  gl.attachShader(programa, compilar(gl.FRAGMENT_SHADER, FRAGMENTOS));
  gl.linkProgram(programa);
  if (!gl.getProgramParameter(programa, gl.LINK_STATUS)) {
    listo();
    return empezarVideo();
  }
  gl.useProgram(programa);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const posicion = gl.getAttribLocation(programa, 'p');
  gl.enableVertexAttribArray(posicion);
  gl.vertexAttribPointer(posicion, 2, gl.FLOAT, false, 0, 0);

  const textura = (unidad: number, fuente: TexImageSource) => {
    const t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unidad);
    gl.bindTexture(gl.TEXTURE_2D, t);
    // Texturas de cualquier tamaño: sin repetición ni mipmaps
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, fuente);
  };
  try {
    textura(1, mapa);
    textura(0, foto);
  } catch {
    listo();
    return empezarVideo();
  }
  const u = (nombre: string) => gl.getUniformLocation(programa, nombre);
  gl.uniform1i(u('uImagen'), 0);
  gl.uniform1i(u('uProfundidad'), 1);
  gl.activeTexture(gl.TEXTURE0);

  // En escritorio la imagen va un 3 % más grande para que el parallax no muestre los bordes
  const zoom = conMouse ? 0.97 : 1;
  let proporcion = foto.naturalWidth / foto.naturalHeight;
  const encuadrar = () => {
    const escala = Math.min(window.devicePixelRatio || 1, 1.5);
    lienzo.width = Math.round(lienzo.clientWidth * escala);
    lienzo.height = Math.round(lienzo.clientHeight * escala);
    gl.viewport(0, 0, lienzo.width, lienzo.height);
    const caja = lienzo.width / lienzo.height;
    const ex = (caja > proporcion ? 1 : caja / proporcion) * zoom;
    const ey = (caja > proporcion ? proporcion / caja : 1) * zoom;
    gl.uniform2f(u('uEscala'), ex, ey);
    gl.uniform2f(u('uDesvio'), (1 - ex) * (POSICION.x - 0.5), (1 - ey) * (POSICION.y - 0.5));
  };

  const mouse = { x: 0, y: 0, dx: 0, dy: 0 };
  let avance = window.__heroVisto ? 1 : 0;
  const pintar = () => {
    const oscuro = raiz.dataset.tema === 'oscuro';
    gl.uniform3f(u('uCubierta'), oscuro ? 0.055 : 1.0, oscuro ? 0.055 : 0.953, oscuro ? 0.055 : 0.878);
    gl.uniform1f(u('uAvance'), avance);
    gl.uniform2f(u('uMouse'), mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  encuadrar();
  pintar();
  lienzo.classList.add('visible');
  listo();

  // Revelado de entrada (solo la primera vez; al cambiar de idioma ya no se repite)
  if (avance < 1) {
    await new Promise<void>((fin) => {
      const inicio = performance.now();
      const paso = (ahora: number) => {
        const t = Math.min(1, (ahora - inicio) / DURACION);
        avance = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        pintar();
        if (t < 1 && lienzo.isConnected) requestAnimationFrame(paso);
        else fin();
      };
      requestAnimationFrame(paso);
    });
  }
  avance = 1;
  empezarVideo();

  // En táctil el lienzo ya cumplió: se retira y queda la foto con el video encima
  if (!conMouse) {
    lienzo.classList.remove('visible');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return;
  }

  // Escritorio: el lienzo sigue dibujando la foto (o el cuadro actual del video) con parallax
  let visible = true;
  let cuadro = 0;
  let ultimoTiempo = -1;
  const bucle = () => {
    cuadro = 0;
    if (!lienzo.isConnected) return;
    mouse.x += (mouse.dx - mouse.x) * 0.06;
    mouse.y += (mouse.dy - mouse.y) * 0.06;
    const reproduciendo = !video.paused && video.readyState >= 2;
    if (reproduciendo && video.currentTime !== ultimoTiempo) {
      ultimoTiempo = video.currentTime;
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
      if (proporcion !== video.videoWidth / video.videoHeight) {
        proporcion = video.videoWidth / video.videoHeight;
        encuadrar();
      }
    }
    pintar();
    const enMovimiento = Math.abs(mouse.dx - mouse.x) + Math.abs(mouse.dy - mouse.y) > 0.002;
    if (visible && !document.hidden && (reproduciendo || enMovimiento)) cuadro = requestAnimationFrame(bucle);
  };
  const despertar = () => {
    if (!cuadro && visible && lienzo.isConnected) cuadro = requestAnimationFrame(bucle);
  };

  media.parentElement!.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      mouse.dx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.dy = (e.clientY / window.innerHeight) * 2 - 1;
      despertar();
    },
    { passive: true },
  );
  video.addEventListener('playing', despertar);
  document.addEventListener('visibilitychange', despertar);
  new ResizeObserver(() => {
    encuadrar();
    pintar();
  }).observe(lienzo);
  // Fuera de pantalla no se dibuja y el video se pausa
  new IntersectionObserver(([entrada]) => {
    visible = entrada.isIntersecting;
    if (visible) {
      if (video.src) video.play().catch(() => {});
      despertar();
    } else video.pause();
  }).observe(media);
}

document.addEventListener('astro:page-load', () => {
  const media = document.querySelector<HTMLElement>('.hero-media');
  if (media) iniciar(media);
});
