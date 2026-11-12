// ─────────────────────────────────────────────────────────────
// SEO content for the whole site — edit titles/descriptions here.
// Page titles are combined with `siteSeo.name` via the title
// template in app.vue ("Calendario · Colla Castellera de Madrid").
// ─────────────────────────────────────────────────────────────

export const siteSeo = {
  name: 'Colla Castellera de Madrid',
  url: 'https://collacastellerademadrid.net',
  locale: 'es_ES',
  lang: 'es',
  description:
    'La Colla Castellera de Madrid levanta castells, tradición catalana declarada Patrimonio Inmaterial de la Humanidad por la UNESCO. Fuerza, equilibrio, valor y seny.',
  image: '/img/covers/DSC_0163.JPG',
}

export interface PageSeo {
  /** Page title (without the site name). Omit to show only the site name. */
  title?: string
  description: string
  /** Path under /public, e.g. '/img/covers/debod.jpg'. Falls back to siteSeo.image */
  image?: string
  /** Set to true to keep the page out of search engines */
  noindex?: boolean
}

export const pageSeo = {
  home: {
    description:
      'Colla Castellera de Madrid: castells en Madrid desde 2017, una sección del Cercle Català de Madrid. Únete a una colla abierta a personas de todas las edades y orígenes.',
  },
  calendario: {
    title: 'Calendario',
    description:
      'Calendario de ensayos, actuaciones y actividades de la Colla Castellera de Madrid.',
  },
  actuaciones: {
    title: 'Actuaciones',
    description:
      'Próximas actuaciones y resultados de temporadas anteriores de la Colla Castellera de Madrid: castells, fotos y crónicas.',
  },
  colla: {
    title: 'La Colla',
    description:
      'Conoce la Colla Castellera de Madrid: su junta directiva y las personas que hacen posible los castells en Madrid.',
    image: '/img/covers/debod.jpg',
  },
  unpismes: {
    title: 'Un pis més',
    description:
      'Un pis més: estadísticas de la Colla Castellera de Madrid. Castells cargados y descargados por temporada y evolución de la colla.',
  },
  archivo: {
    title: 'Archivo',
    description:
      'Archivo histórico de la Colla Castellera de Madrid: temporadas, actuaciones y castells desde 2017.',
  },
  admin: {
    title: 'Admin',
    description: 'Administración de datos.',
    noindex: true,
  },
  apiTest: {
    title: 'API test',
    description: 'Prueba de la API de Google Sheets.',
    noindex: true,
  },
} satisfies Record<string, PageSeo>

export type PageSeoKey = keyof typeof pageSeo
