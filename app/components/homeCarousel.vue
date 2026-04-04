<script setup lang="ts">
  import emblaCarouselVue from 'embla-carousel-vue'

  const [emblaRef, emblaApi] = emblaCarouselVue({
    loop: true,
  })

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
        '/img/covers/DSC_0163.JPG',
      '/img/covers/debod.jpg',
      '/img/gallery/IMG-20191012-WA0032.jpg',
      '/img/gallery/IMG-20191013-WA0018.jpg',
      '/img/gallery/Red_XES6190.jpg',
      '/img/gallery/Red_XES6264.jpg'
    ]
  });
</script>

<template>
 <div class="embla h-136 bg-gray-200" ref="emblaRef">
    <div class="embla__container h-full relative">

      <div  
        v-for="(img,index) in props.images"
        class="embla__slide relative h-full w-full shrink-0"
        :key="img"
      >
        <!-- place an image on the background and a div content above-->
        <NuxtImg :src="img" alt="carousel image 1" class="w-full h-full object-cover"/>

        <div class="absolute top-0 left-0 w-full h-full bg-black/10 text-white text-2xl  bg-black-10">

            <div class="w-1/3 ml-[50%]  h-full py-24 text-right">
                <h3 class="font-display font-bold text-5xl tracking-tight text-shadow-lg/30 ">Hacemos Castells&nbsp;<br/><span class="font-normal"> ... en</span> Madrid.</h3>

                <p>¿ te ANIMAS ?</p>
                <p class="p-24">Slide {{ index + 1 }} Content  </p > 
            </div>


          
        </div>

      </div>

      
    </div>

    <!-- embla navigation buttons  absolute top-1/3 left-0 right-0 -->
    <div class="flex justify-between h-136 absolute top-0 left-0 right-0">
        <button class="embla__prev text-3xl  cursor-pointer font-light hover:bg-black/20 h-full" @click="scrollPrev">
            <Icon name="mdi:chevron-left" style="color: white" size="48"/>
        </button>
        <button class="embla__next text-3xl  cursor-pointer font-light hover:bg-black/20 h-full" @click="scrollNext">
            <Icon name="mdi:chevron-right" style="color: white" size="48"/>
        </button>
    </div>

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
