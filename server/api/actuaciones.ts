export default defineEventHandler(async () => {
  const [actuacionesCSV, castellsCSV, imagesCSV] = await Promise.all([
    readLocalCSV(DATA_SOURCES.actuaciones.file),
    readLocalCSV(DATA_SOURCES.castells.file),
    readLocalCSV(DATA_SOURCES.imgActuaciones.file).catch(() => ''),
  ])

  const actuaciones = parseCSV(actuacionesCSV)
  const castells_list = parseCSV(castellsCSV).map(c => ({ ...c, score: Number(c.score) }))

  const collas = [...new Set(
    actuaciones.flatMap(a => (a.con ?? '').split(',').map(c => c.trim()).filter(Boolean)),
  )].sort((a, b) => a.localeCompare(b, 'ca'))

  // images grouped by event id, in sheet order
  const images: Record<string, GalleryImage[]> = {}
  if (imagesCSV.trim()) {
    for (const row of parseCSV(imagesCSV)) {
      const id = (row['event-id'] ?? row.event_id ?? row.id ?? '').trim()
      const { img, full } = resolveImageUrls(row.img ?? '')
      if (!id || !img) continue
      const list = (images[id] ??= [])
      list.push({ rank: String(list.length + 1), img, full, texto: row.text ?? row.texto ?? '' })
    }
  }

  return { actuaciones, castells_list, collas, images }
})
