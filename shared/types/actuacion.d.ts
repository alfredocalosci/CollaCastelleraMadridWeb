interface Actuacion {
  id: string
  fecha: string
  nombre: string
  ciudad: string
  lugar: string
  hora: string
  con: string
  castells: string
  pilars: string
  castells_array?: string[]
  pilars_array?: string[]
}

interface Castell {
  castell: string
  score: number
  image: string
}
