export const ui = {
  es: {
    meta: {
      titulo: 'Pyero.workz — Edición de video y motion graphics',
      descripcion:
        'Portafolio de Pyero.workz: diseño gráfico, edición de video y motion graphics para marcas y creadores de contenido.',
    },
    nav: { servicios: 'Servicios', sobre: 'Sobre mí', contacto: 'Contacto', cta: 'Hablemos' },
    hero: {
      estado: 'Disponible para nuevos proyectos',
      titulo: ['Eleva tu', 'contenido', 'entendiendo tu', 'marca'],
      bajada:
        'Soy diseñador gráfico especializado en edición de video y motion graphics. Convierto la esencia de tu marca en piezas que se quedan en la cabeza.',
      cta: 'Escríbeme por WhatsApp',
      secundario: 'Ver servicios',
      proximamente: 'Video próximamente',
    },
    marquee: 'Marcas y creadores con los que he trabajado',
    servicios: {
      etiqueta: 'Servicios',
      titulo: ['Tres formas de', 'mover', 'tu marca'],
      lista: [
        {
          titulo: 'Edición de video',
          texto:
            'Reels, TikToks y videos para redes con ritmo, subtítulos, color y sonido pensados para retener desde el primer segundo.',
        },
        {
          titulo: 'Motion graphics',
          texto:
            'Animación de textos, logos y gráficos que explican tu mensaje y le dan a tu contenido una identidad propia.',
        },
        {
          titulo: 'Diseño gráfico para redes',
          texto:
            'Posts y carruseles con una línea visual coherente, para que tu marca se reconozca en cada publicación.',
        },
      ],
    },
    sobre: {
      etiqueta: 'Sobre mí',
      titulo: ['Diseño con mirada de', 'marketing'],
      parrafos: [
        'Soy Pyero, diseñador gráfico especializado en edición de video y motion graphics. Actualmente curso el 5.º ciclo de Marketing en la Universidad Continental, y eso me permite pensar cada pieza desde la estrategia y no solo desde lo visual.',
        'He trabajado con clínicas, marcas de moda y creadores de contenido. Antes de abrir un programa, me ocupo de entender qué hace única a tu marca; después lo traduzco en contenido.',
      ],
      herramientas: 'Herramientas que uso',
      foto: 'Tu foto aquí',
    },
    contacto: {
      etiqueta: 'Contacto',
      titulo: ['¿Hacemos que tu', 'marca', 'se mueva?'],
      texto: 'Cuéntame qué necesitas y te respondo por WhatsApp.',
      cta: 'Escríbeme por WhatsApp',
      redes: 'Sígueme',
    },
    pie: 'Todos los derechos reservados.',
    whatsapp: 'Chatear por WhatsApp',
    idioma: 'Cambiar idioma',
  },
  en: {
    meta: {
      titulo: 'Pyero.workz — Video editing & motion graphics',
      descripcion:
        'Pyero.workz portfolio: graphic design, video editing and motion graphics for brands and content creators.',
    },
    nav: { servicios: 'Services', sobre: 'About', contacto: 'Contact', cta: "Let's talk" },
    hero: {
      estado: 'Available for new projects',
      titulo: ['Elevate your', 'content', 'by understanding your', 'brand'],
      bajada:
        "I'm a graphic designer specialized in video editing and motion graphics. I turn the essence of your brand into pieces that stick.",
      cta: 'Message me on WhatsApp',
      secundario: 'See services',
      proximamente: 'Video coming soon',
    },
    marquee: 'Brands and creators I have worked with',
    servicios: {
      etiqueta: 'Services',
      titulo: ['Three ways to', 'move', 'your brand'],
      lista: [
        {
          titulo: 'Video editing',
          texto:
            'Reels, TikToks and social videos with pacing, captions, color and sound built to hold attention from the first second.',
        },
        {
          titulo: 'Motion graphics',
          texto:
            'Animated type, logos and graphics that explain your message and give your content its own identity.',
        },
        {
          titulo: 'Graphic design for social media',
          texto:
            'Posts and carousels with a consistent visual line, so your brand is recognized in every publication.',
        },
      ],
    },
    sobre: {
      etiqueta: 'About me',
      titulo: ['Design with a', 'marketing', 'mindset'],
      parrafos: [
        "I'm Pyero, a graphic designer specialized in video editing and motion graphics. I'm currently in the 5th term of my Marketing degree at Universidad Continental, which lets me approach every piece from strategy and not only from visuals.",
        'I have worked with clinics, fashion brands and content creators. Before opening any software, I make sure I understand what makes your brand unique; then I translate it into content.',
      ],
      herramientas: 'Tools I use',
      foto: 'Your photo here',
    },
    contacto: {
      etiqueta: 'Contact',
      titulo: ["Let's get your", 'brand', 'moving'],
      texto: "Tell me what you need and I'll reply on WhatsApp.",
      cta: 'Message me on WhatsApp',
      redes: 'Follow me',
    },
    pie: 'All rights reserved.',
    whatsapp: 'Chat on WhatsApp',
    idioma: 'Switch language',
  },
} as const;

export type Idioma = keyof typeof ui;
