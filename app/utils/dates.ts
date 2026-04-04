// parses "d/MM/yyyy" → Date
export function parseDate(fecha: string): Date {
    const [d, m, y] = fecha.split('/')
    return new Date(`${y}-${m?.padStart(2, '0')}-${d?.padStart(2, '0')}`)
}

export function formatDate(fecha: string, locale: string = 'es-ES', options?: Intl.DateTimeFormatOptions): string {
    const date = parseDate(fecha)
    return date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric', ...options })
}

export const veryShortWeekDays = ['D', 'L', 'M', 'X', 'J', 'V', 'S']