// Anchos y tamaño en pantalla de la imagen del hero; los comparten Hero.astro y la precarga del <head>.
// La imagen cubre toda la pantalla: en pantallas altas (celular) se ve más ancha que la ventana, de ahí el max().
export const ANCHOS_HERO = [960, 1440, 1920, 2560];
export const SIZES_HERO = 'max(100vw, 180vh)';
