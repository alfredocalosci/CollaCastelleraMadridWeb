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
        <main class="flex-1 min-h-0 p-6 pb-12 flex items-center justify-center ">
          <NuxtImg 
            :src="selectedImage" 
            :alt="'Selected image'"
            class="max-w-full max-h-full object-contain"
            @click="closeModal"
          />
        </main>
        
      </div>
    </div>
  </Teleport>

  <!-- image grid -->
  <div class="columns-1 md:columns-4 md:gap-4 md:space-y-4">
    <div 
      v-for="(image, index) in props.images" 
      :key="index"
      class="break-inside-avoid mb-4"
    >
      <NuxtImg 
        :src="image" 
        :alt="`Gallery image ${index + 1}`"
        class="w-full h-auto rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
        @click="openModal(image)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
  const modalOpen = ref(false);
  const selectedImage = ref('');

  const props = withDefaults(defineProps<{
    images?: Array<string>;
  }>(), {
    images: () => [
      'https://collacastellerademadrid.net/cloud/index.php/s/Q6GSWciocNg6a5C/preview',
      'https://collacastellerademadrid.net/cloud/index.php/s/LrCcZBcgQGQRAQZ/preview',
      'https://collacastellerademadrid.net/cloud/index.php/s/i9mZj3wjpbtwNxa/preview',
      'https://collacastellerademadrid.net/cloud/index.php/apps/files_sharing/publicpreview/X8TgtMGTWD3BxDn?fileId=78151&file=/2025/13.%20Diada%20Xiquets%20de%20Reus/Whatsapps%20varios/IMG-20251027-WA0035.jpg&x=1512&y=982&a=true',
      'https://collacastellerademadrid.net/cloud/index.php/apps/files_sharing/publicpreview/X8TgtMGTWD3BxDn?fileId=82190&file=/2026/2.%20Villaverde%20Bajo/Doina%20Olteanu/WhatsApp%20Image%202026-03-15%20at%2015.37.02.jpeg&x=1512&y=982&a=true',
      'https://collacastellerademadrid.net/cloud/index.php/apps/files_sharing/publicpreview/X8TgtMGTWD3BxDn?fileId=69382&file=/2025/8.%20Joves%20de%20Valls%20(28.6.25)/I%C3%B1aki%20Grao/20250628-_6280516.jpg&x=1512&y=982&a=true',
      '/img/gallery/Red_XES6264.jpg'
    ]
  });

  const openModal = (imageSrc: string) => {
    selectedImage.value = imageSrc;
    modalOpen.value = true;
  };

  const closeModal = () => {
    modalOpen.value = false;
    selectedImage.value = '';
  };

</script>

<style scoped>

</style>