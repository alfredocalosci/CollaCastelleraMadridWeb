export function parseDate(fecha: string): Date {
    if (/^\d{4}-\d{2}-\d{2}$/.test(fecha))
        return new Date(fecha)
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(fecha)) {
        const [d = '01', m = '01', y = '2000'] = fecha.split('/')
        return new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`)
    }
    return new Date(fecha)
}

export function formatDate(fecha: string, locale: string = 'es-ES', options?: Intl.DateTimeFormatOptions): string {
    const date = parseDate(fecha)
    return date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric', ...options })
}

export const veryShortWeekDays = ['D', 'L', 'M', 'X', 'J', 'V', 'S']