<script lang="ts" setup>
// Site-wide defaults; each page refines these with usePageSeo().
useHead({
  htmlAttrs: { lang: siteSeo.lang },
  titleTemplate: (title) => (title ? `${title} · ${siteSeo.name}` : siteSeo.name),
})

useSeoMeta({
  description: siteSeo.description,
  ogSiteName: siteSeo.name,
  ogType: 'website',
  ogLocale: siteSeo.locale,
  twitterCard: 'summary_large_image',
})
</script>

<template>
   <GlobalHeader />
    <NuxtPage />
    <GlobalFooter />
</template>
