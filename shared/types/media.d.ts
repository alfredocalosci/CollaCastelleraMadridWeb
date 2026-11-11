interface CarouselSlide {
  rank: string
  img: string
  titulo: string
  texto: string
  call_for_action?: string
  call_for_action_url?: string
}

interface GalleryImage {
  rank: string
  img: string
  full?: string
  texto: string
}

interface CalendarEvent {
  id: string
  fecha: string
  tipo: string
  nombre: string
  ciudad: string
  lugar: string
  hora: string
}
