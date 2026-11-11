const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbwz2GkhhtvkGpSqDilidb7pQl3lS5FPSzMKIFc6BegSP3Vh6M_57xhXKyw5fmn580on/exec'

export async function fetchTabFromGoogle(tab: string): Promise<string> {
  return $fetch<string>(GOOGLE_SHEETS_URL, {
    query: { tab },
    parseResponse: (txt) => txt,
  })
}
