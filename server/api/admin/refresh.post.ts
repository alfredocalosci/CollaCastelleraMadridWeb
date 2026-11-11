interface RefreshResult {
  key: DataSourceKey
  ok: boolean
  rows?: number
  updatedAt?: string
  error?: string
}

async function refreshOne(key: DataSourceKey): Promise<RefreshResult> {
  const source = DATA_SOURCES[key]
  try {
    const csv = await fetchTabFromGoogle(source.tab)
    if (!csv || !csv.trim()) throw new Error('Respuesta vacía de Google Sheets')

    if (csv.trimStart().startsWith('{"error"')) throw new Error(`Apps Script: ${csv.trim()}`)

    await writeLocalCSV(source.file, csv)
    const rows = csv.trim().split('\n').length - 1
    return { key, ok: true, rows, updatedAt: new Date().toISOString() }
  } catch (e) {
    return { key, ok: false, error: e instanceof Error ? e.message : 'Error desconocido' }
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ key: DataSourceKey | 'all' }>(event)
  const keys = body?.key === 'all'
    ? (Object.keys(DATA_SOURCES) as DataSourceKey[])
    : [body?.key]

  if (!keys[0] || keys.some(k => !DATA_SOURCES[k])) {
    throw createError({ statusCode: 400, statusMessage: 'Parámetro "key" inválido.' })
  }

  const results = await Promise.all(keys.map(refreshOne))
  return { results }
})
