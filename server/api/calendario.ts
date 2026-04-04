const SHEET_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQqT6tQjxi8a_qKuT6fnNfoTXKVIMRWKHD2Qq7I-9c-tM3_PRM-_TEpdyCTGSKgu7jpDdB_jV-Wo2II/pub?gid=1900393250&single=true&output=csv'

function parseCSVRow(row: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < row.length; i++) {
    const char = row[i]
    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') { current += '"'; i++ } // escaped quote
      else inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  fields.push(current.trim())
  return fields
}

export default defineCachedEventHandler(async () => {
  const csv = await $fetch<string>(SHEET_URL)

  const [headerLine, ...rows] = csv.trim().split('\n')
  const headers = parseCSVRow(headerLine)

  return rows
    .filter(row => row.trim())
    .map(row => Object.fromEntries(parseCSVRow(row).map((val, i) => [headers[i], val])))
}, { maxAge: 60 * 10 })
