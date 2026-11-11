export default defineEventHandler(async () => {
  const csv = await readLocalCSV(DATA_SOURCES.galeria.file)
  const rows = parseCSV(csv) as unknown as GalleryImage[]
  return rows
    .map(r => ({ ...r, ...resolveImageUrls(r.img) }))
    .sort((a, b) => Number(a.rank) - Number(b.rank))
})
