export function parseCSVRow(row: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < row.length; i++) {
    const char = row[i]
    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') { current += '"'; i++ }
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

export function parseCSV(csv: string): Record<string, string>[] {
  const [headerLine, ...rows] = csv.trim().split('\n')
  const headers = parseCSVRow(headerLine)
  return rows
    .filter(row => row.trim())
    .map(row => Object.fromEntries(parseCSVRow(row).map((val, i) => [headers[i], val])))
}
