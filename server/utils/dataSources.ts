export const DATA_SOURCES = {
  actuaciones: { tab: 'DAT_ACTUACIONES', file: 'actuaciones.csv', label: 'Actuaciones' },
  castells: { tab: 'AUX_CASTELLS', file: 'castells.csv', label: 'Castells y pilars' },
  calendario: { tab: 'WEB_CALENDARIO', file: 'calendario.csv', label: 'Calendario' },
  portada: { tab: 'WEB_HOME_CAROUSEL', file: 'portada.csv', label: 'Portada (carrusel)' },
  imgActuaciones: { tab: 'WEB_IMG_ACTUACIONES', file: 'imgActuaciones.csv', label: 'Imágenes de actuaciones' },
  galeria: { tab: 'WEB_HOME_GALLERY', file: 'galeria.csv', label: 'Galería' },
} as const

export type DataSourceKey = keyof typeof DATA_SOURCES
