<template>
  <div
    :id="id"
    role="region"
    class="grid transition-[grid-template-rows] duration-300 ease-in-out"
    :class="open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
    :aria-hidden="!open"
    :inert="!open"
  >
    <div class="overflow-hidden min-h-0">
      <!-- content is rendered lazily on first open, then kept so the closing animation can play -->
      <slot v-if="hasOpened" />
    </div>
    
  </div>
</template>

<script lang="ts" setup>
  const props = defineProps<{
    open?: boolean
    id?: string
  }>();

  const hasOpened = ref(!!props.open);

  watch(() => props.open, (value) => {
    if (value) hasOpened.value = true;
  });
</script>
