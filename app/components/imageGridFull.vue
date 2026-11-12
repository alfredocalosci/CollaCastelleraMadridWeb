<template>

  <!-- modal container: full screen-->
  <Teleport to="body">
    <div 
      v-if="modalOpen" 
      class="fixed inset-0 bg-black/90 flex flex-col z-50 w-screen h-screen "
      @click.self="closeModal"
    >
      <!-- Modal Content Container -->
      <div class="flex flex-col h-full w-full">
        
        <!-- Header with close button -->
        <header class="flex justify-end items-center p-2 ">
          <h3 class="text-xl pt-2 uppercase pr-6 text-white" @click="closeModal">close</h3>
          <button 
            class="text-white hover:text-nrj-500 text-6xl font-bold transition-colors pr-6 cursor-pointer"
            @click="closeModal"
          >
            &times;
          </button>
        </header>

        <!-- Main content area for the image -->
        <main
          class="relative flex-1 min-h-0 p-6 pb-12 flex items-center justify-center touch-pan-y select-none"
          @pointerdown="onPointerDown"
          @pointerup="onPointerUp"
          @click.capture="onClickCapture"
        >
          <button
            v-if="hasMultiple"
            type="button"
            aria-label="Previous image"
            class="absolute left-2 top-1/2 -translate-y-1/2 z-10 text-white hover:text-nrj-500 transition-colors cursor-pointer"
            @click.stop="showPrev"
          >
            <Icon name="mdi:chevron-left" size="48" />
          </button>

          <NuxtImg
            :key="selectedImage"
            :src="selectedImage"
            :alt="selectedAlt"
            class="max-w-full max-h-full object-contain"
            draggable="false"
            @click="closeModal"
          />

          <button
            v-if="hasMultiple"
            type="button"
            aria-label="Next image"
            class="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-white hover:text-nrj-500 transition-colors cursor-pointer"
            @click.stop="showNext"
          >
            <Icon name="mdi:chevron-right" size="48" />
          </button>

          <p v-if="hasMultiple" class="absolute bottom-3 left-0 right-0 text-center text-sm text-white/70">
            {{ selectedIndex + 1 }} / {{ props.images.length }}
          </p>
        </main>

      </div>
    </div>
  </Teleport>

  <!-- image grid -->
  <div class="columns-1 md:columns-3 lg:columns-4 md:gap-1 md:space-y-1 w-full">
    <div 
      v-for="(image, index) in props.images" 
      :key="index"
      class="break-inside-avoid "
    >
      <NuxtImg
        :src="image.img"
        :alt="image.texto || `Gallery image ${index + 1}`"
        class="w-full h-auto cursor-pointer"
        loading="lazy"
        @click="openModal(index)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
  const modalOpen = ref(false);

  const props = withDefaults(defineProps<{
    images?: GalleryImage[]
  }>(), {
    images: () => [
      {
        rank: '1',
        img: '/img/gallery/IMG-20191013-WA0018.jpg',
        texto: 'Image 1'
      },
      {
        rank: '2',
        img: '/img/gallery/Red_XES6190.jpg',
        texto: 'Image 2'
      },
      {
        rank: '3',
        img: '/img/gallery/DSC_0288.JPG',
        texto: 'Image 3'
      },
       {
        rank: '4',
        img: '/img/gallery/IMG-20191012-WA0032.jpg',
        texto: 'Image 4'
      },
      {
        rank: '5',
        img: '/img/gallery/Red_XES6264.jpg',
        texto: 'Image 5'
      }
    ]
  });

  /*
   rank: string
  img: string
  texto: string
  */

  const selectedIndex = ref(-1);

  const selectedImage = computed(() => {
    const image = props.images[selectedIndex.value];
    return image ? (image.full ?? image.img) : '';
  });
  const selectedAlt = computed(() => props.images[selectedIndex.value]?.texto || 'Selected image');
  const hasMultiple = computed(() => props.images.length > 1);

  const openModal = (index: number) => {
    selectedIndex.value = index;
    modalOpen.value = true;
  };

  const closeModal = () => {
    modalOpen.value = false;
    selectedIndex.value = -1;
  };

  const showNext = () => {
    if (!hasMultiple.value) return;
    selectedIndex.value = (selectedIndex.value + 1) % props.images.length;
  };

  const showPrev = () => {
    if (!hasMultiple.value) return;
    selectedIndex.value = (selectedIndex.value - 1 + props.images.length) % props.images.length;
  };

  // swipe / drag (touch and mouse): horizontal movement > 50px and dominant over vertical
  let startX = 0;
  let startY = 0;
  let swiped = false;

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    startX = e.clientX;
    startY = e.clientY;
    swiped = false;
  };

  const onPointerUp = (e: PointerEvent) => {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
    swiped = true;
    if (dx < 0) showNext(); else showPrev();
  };

  // a drag ends with a click on the image: swallow it so the modal doesn't close
  const onClickCapture = (e: MouseEvent) => {
    if (!swiped) return;
    swiped = false;
    e.stopPropagation();
  };

  const onKeydown = (e: KeyboardEvent) => {
    if (!modalOpen.value) return;
    if (e.key === 'ArrowRight') showNext();
    else if (e.key === 'ArrowLeft') showPrev();
    else if (e.key === 'Escape') closeModal();
  };

  onMounted(() => window.addEventListener('keydown', onKeydown));
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));

</script>

<style scoped>

</style>