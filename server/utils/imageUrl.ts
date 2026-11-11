// Nextcloud public share links (…/index.php/s/<token>) serve an HTML page.
// /preview returns a resized image (grids, carousels), /download the original (modal view).
const SHARE_RE = /\/s\/[A-Za-z0-9]+\/?$/

export function resolveImageUrls(url: string): { img: string, full: string } {
  const clean = url.trim()
  if (!SHARE_RE.test(clean)) return { img: clean, full: clean }
  const base = clean.replace(/\/$/, '')
  return { img: `${base}/preview`, full: `${base}/download` }
}
