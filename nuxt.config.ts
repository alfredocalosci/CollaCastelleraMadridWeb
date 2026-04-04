// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/content', '@nuxt/image', '@nuxt/ui','@yuta-inoue-ph/nuxt-vcalendar','v-gsap-nuxt'
],
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://use.typekit.net/yjc6aby.css'
        }
      ]
    }
  },
  fonts: {
    families: [
      { name: 'IBM Plex Sans', provider: 'bunny', weights: [300,700], styles: ['normal', 'italic'] },
    ]
  }
})