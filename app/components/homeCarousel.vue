<script setup lang="ts">
  import emblaCarouselVue from 'embla-carousel-vue'

  const [emblaRef, emblaApi] = emblaCarouselVue({ loop: true })

  function scrollNext() { emblaApi.value?.scrollNext() }
  function scrollPrev() { emblaApi.value?.scrollPrev() }

  const props = withDefaults(defineProps<{
    slides?: CarouselSlide[]
  }>(), {
    slides: () => [
      {
        rank: '10',
        img: '/img/covers/DSC_0163.JPG',
        titulo: 'Portada 1',
        texto: 'Texto descriptivo para la portada 1',
        call_for_action: 'Ver más',
        call_for_action_url: '/unpismes'
      },
      {
        rank: '20',
        img: '/img/covers/debod.jpg',
        titulo: 'Portada 2',
        texto: 'Texto descriptivo para la portada 2',
        call_for_action: 'Ver más',
        call_for_action_url: '/archivo'
      }
    ]
  })

  /*
  rank: string
  img: string
  titulo: string
  texto: string
  call_for_action: string
  call_for_action_url: string
  */
</script>

<template>
  <div class="embla h-136 bg-gray-200" ref="emblaRef">
    <div class="embla__container h-full relative">

      <div
        v-for="(slide, index) in props.slides"
        class="embla__slide relative h-full w-full shrink-0"
        :key="index"
      >
        <NuxtImg :src="slide.img" :alt="slide.titulo" class="w-full h-full object-cover"/>

        <div class="absolute top-0 left-0 w-full h-full bg-black/10 text-white text-2xl">
          <!-- text over  -->
          <div class="w-3/5 ml-[25%] h-full py-24 text-right">
            <h3 class="font-display font-bold text-5xl tracking-tight text-shadow-lg/30">
              {{ slide.titulo }}
            </h3>
            <p v-if="slide.texto">{{ slide.texto }}</p>

            <NuxtLink
              v-if="slide.call_for_action && slide.call_for_action_url"
              :to="slide.call_for_action_url"
              class="inline-block mt-6 px-6 py-2 bg-rosso-500 text-white font-display font-bold uppercase tracking-wide hover:bg-nrj-500 transition-colors cursor-pointer shadow-md hover:shadow-lg"
            >
              {{ slide.call_for_action }}
            </NuxtLink>

          </div>
        </div>

      </div>

    </div>

    <div class="flex justify-between h-136 absolute top-0 left-0 right-0 pointer-events-none">
      <button class="embla__prev text-3xl cursor-pointer font-light hover:bg-black/20 h-full pointer-events-auto" @click="scrollPrev">
        <Icon name="mdi:chevron-left" style="color: white" size="48"/>
      </button>
      <button class="embla__next text-3xl cursor-pointer font-light hover:bg-black/20 h-full pointer-events-auto" @click="scrollNext">
        <Icon name="mdi:chevron-right" style="color: white" size="48"/>
      </button>
    </div>

  </div>
</template>

<style scoped>
  .embla { overflow: hidden; }
  .embla__container { display: flex; }
  .embla__slide { flex: 0 0 100%; min-width: 0; }
</style>
