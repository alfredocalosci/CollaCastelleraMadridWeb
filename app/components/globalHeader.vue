<template>
  <header 
    class="w-full bg-black py-2.5 border-b border-white/50 fixed top-0 z-40 transition-transform duration-300 "
    :class="{ '-translate-y-full': !showHeader }"
  >
    <div class="ccm_container  h-full flex items-center justify-between">

      <div class="flex items-center gap-x-4">
        <!--<Icon name="mdi:dots-vertical" style="color: white" size="24"/>-->
        <NuxtLink to="/playground">
           <h1 class="font-display font-bold text-white text-[15px]/6 subpixel-antialiased">Colla Castellera<span class="font-normal"> de </span>Madrid</h1>
        </NuxtLink>
       
      </div>

      <nav>
        <ul class="flex gap-x-6 text-white text-sm/6 uppercase subpixel-antialiased">
          <li><NuxtLink to="/calendario">calendario</NuxtLink></li>
          <li><NuxtLink to="/actuaciones/">actuaciones</NuxtLink></li>
          <li><NuxtLink to="/colla">la colla</NuxtLink></li>
          <li><a href="#contacto">media</a></li>
          <li><a href="https://collacastellerademadrid.net/pinyator/Apuntat.php?reset=1" target="_blank" class="text-gray-100 italic">pinyator</a></li>
          <li><Icon name="mdi:dots-vertical" style="color: white" size="21"/></li>
        </ul>
      </nav>

    </div>
  </header>
</template>

<script lang="ts" setup>
const showHeader = ref(true);
const lastScrollY = ref(0);

onMounted(() => {
  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY < lastScrollY.value || currentScrollY < 10) {
      // Scrolling up or at the top
      showHeader.value = true;
    } else {
      // Scrolling down
      showHeader.value = false;
    }
    
    lastScrollY.value = currentScrollY;
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
  });
});
</script>

<style scoped>
  @reference "tailwindcss";
  @reference "~/assets/css/main.css";

  nav ul li a {
    @apply transition-colors duration-200 text-gray-300 hover:text-white;
  }

  nav ul li a.router-link-active,  nav ul li a.router-link-exact-active {
    @apply text-white;
  }

</style>