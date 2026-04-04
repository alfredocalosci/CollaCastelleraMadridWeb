<template>
  <div class="w-full h-136 bg-gray-200">
    <NuxtImg :src="props.src" :alt="props.alt" class="w-full h-full object-cover" />
  </div>
</template>

<script lang="ts" setup>
  // props with default: one image source
  const props = withDefaults(defineProps<{
    src?: string;
    alt?: string;
  }>(), {
    src: '/img/covers/debod.jpg',
    alt: 'big image placeholder'
  }); 
</script>

<style>

</style>