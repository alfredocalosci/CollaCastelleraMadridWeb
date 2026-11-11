export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const tabName = query.tab as string

  if (!tabName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El parámetro "tab" es obligatorio.',
    })
  }

  try {
    const csvData = await fetchTabFromGoogle(tabName)

    setHeaders(event, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${tabName}.csv"`,
    })

    return csvData
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al conectar con Google Sheets.',
    })
  }
})
