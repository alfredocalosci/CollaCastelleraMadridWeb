export default defineEventHandler(async () => {
  const csv = await readLocalCSV(DATA_SOURCES.portada.file)
  const rows = parseCSV(csv) as unknown as CarouselSlide[]
  return rows
    .map(r => ({ ...r, img: resolveImageUrls(r.img).img }))
    .sort((a, b) => Number(a.rank) - Number(b.rank))
})
