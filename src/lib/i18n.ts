import textos from '../data/textos.json';

export type Idioma = keyof typeof textos;

export const textosDe = (lang: Idioma) => textos[lang];

// En inglés usa el campo con sufijo _en si existe; si no, cae al español
export const tr = (objeto: Record<string, unknown>, campo: string, lang: Idioma) =>
  String((lang === 'en' && objeto[`${campo}_en`]) || objeto[campo] || '');

export const ruta = (lang: Idioma, resto = '') => (lang === 'en' ? '/en/' : '/') + resto;
