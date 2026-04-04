<script setup lang="ts">
  import emblaCarouselVue from 'embla-carousel-vue'

  const [emblaRef, emblaApi] = emblaCarouselVue()

  function scrollNext() {
    emblaApi.value?.scrollNext()
  }

  function scrollPrev() {
    emblaApi.value?.scrollPrev()
  }

  const props = withDefaults(defineProps<{
    images?: Array<string>;
  }>(), {
    images: () => [
      '/img/gallery/DSC_0288.JPG',
      '/img/gallery/IMG-20191012-WA0032.jpg',
      '/img/gallery/IMG-20191013-WA0018.jpg',
      '/img/gallery/Red_XES6190.jpg',
      '/img/gallery/Red_XES6264.jpg'
    ]
  });
</script>

<template>
 <div class="embla" ref="emblaRef">
    <div class="embla__container">
      <div class="embla__slide">Slide 1</div>
      <div class="embla__slide">Slide 2</div>
      <div class="embla__slide">Slide 3</div>
    </div>

    <button class="embla__prev text-3xl bg-gray-200  " @click="scrollPrev">←</button>
    <button class="embla__next text-3xl bg-gray-200  " @click="scrollNext">→</button>

  </div>
</template>


<style scoped>
  .embla {
    overflow: hidden;
  }
  .embla__container {
    display: flex;
  }
  .embla__slide {
    flex: 0 0 100%;
    min-width: 0;
  }
</style>
