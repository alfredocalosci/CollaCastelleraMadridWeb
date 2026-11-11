const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// The CSV holds Date.toString() output ("Sat Oct 03 2026 00:00:00 GMT+0200 ...").
// Read the calendar day as written; going through toISOString() converts to UTC and shifts it back a day.
function toISODay(fecha: string): string {
  const m = fecha.match(/^\w{3} (\w{3}) (\d{2}) (\d{4})/)
  const month = m ? MONTHS.indexOf(m[1]!) : -1
  if (!m || month < 0) return new Date(fecha).toISOString().substring(0, 10)
  return `${m[3]}-${String(month + 1).padStart(2, '0')}-${m[2]}`
}

export default defineEventHandler(async () => {
  const csv = await readLocalCSV(DATA_SOURCES.calendario.file)
  return (parseCSV(csv) as unknown as CalendarEvent[])
    .filter(item => item.fecha && item.nombre)
    .map(item => ({
      ...item,
      fecha: toISODay(item.fecha)
    }))
})
