import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const DATA_DIR = join(process.cwd(), 'public/data')

function filePath(file: string): string {
  return join(DATA_DIR, file)
}

export async function readLocalCSV(file: string): Promise<string> {
  return readFile(filePath(file), 'utf-8')
}

export async function writeLocalCSV(file: string, csv: string): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(filePath(file), csv, 'utf-8')
}

export async function statLocalCSV(file: string) {
  try {
    const s = await stat(filePath(file))
    return { exists: true, updatedAt: s.mtime.toISOString(), sizeBytes: s.size }
  } catch {
    return { exists: false, updatedAt: null, sizeBytes: 0 }
  }
}
