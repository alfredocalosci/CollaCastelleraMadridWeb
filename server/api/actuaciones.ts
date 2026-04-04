const SHEET_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQqT6tQjxi8a_qKuT6fnNfoTXKVIMRWKHD2Qq7I-9c-tM3_PRM-_TEpdyCTGSKgu7jpDdB_jV-Wo2II/pub?gid=0&single=true&output=tsv'

export default defineCachedEventHandler(async () => {
  const tsv = await $fetch<string>(SHEET_URL)

  const [headerLine, ...rows] = tsv.trim().split('\n')
  const headers = headerLine.split('\t')

  return rows.map(row =>
    Object.fromEntries(row.split('\t').map((val, i) => [headers[i].trim(), val.trim()]))
  )
}, { maxAge: 60 * 10 })
