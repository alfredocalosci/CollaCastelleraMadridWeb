export default defineEventHandler(async () => {
  const entries = Object.entries(DATA_SOURCES) as [DataSourceKey, typeof DATA_SOURCES[DataSourceKey]][]

  return Promise.all(entries.map(async ([key, source]) => ({
    key,
    label: source.label,
    tab: source.tab,
    file: source.file,
    ...await statLocalCSV(source.file),
  })))
})
