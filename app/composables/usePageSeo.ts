/**
 * Apply title, description, Open Graph and Twitter tags for a page.
 * Content lives in app/utils/seo.ts; `overrides` lets a page set dynamic values.
 */
export function usePageSeo(key: PageSeoKey, overrides: Partial<PageSeo> = {}) {
  const page: PageSeo = { ...pageSeo[key], ...overrides }
  const route = useRoute()

  const fullTitle = page.title ? `${page.title} · ${siteSeo.name}` : siteSeo.name
  const image = new URL(page.image ?? siteSeo.image, siteSeo.url).href
  const url = new URL(route.path, siteSeo.url).href

  useSeoMeta({
    title: page.title ?? null,
    description: page.description,
    ogTitle: fullTitle,
    ogDescription: page.description,
    ogImage: image,
    ogUrl: url,
    twitterTitle: fullTitle,
    twitterDescription: page.description,
    twitterImage: image,
    robots: page.noindex ? 'noindex, nofollow' : undefined,
  })

  useHead({
    link: [{ rel: 'canonical', href: url }],
  })
}
