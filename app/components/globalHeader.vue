<template>
  <header 
    class="w-full bg-black py-2.5 border-b border-white/50 fixed top-0 z-40 transition-transform duration-300 "
    :class="{ '-translate-y-full': !showHeader }"
  >
    <div class="ccm_container h-full flex justify-between lg:items-center ">

      <div class="flex items-center  gap-x-4">
        
        <NuxtLink to="/">
           <h1 class="font-display font-bold text-white text-[16px]/6 subpixel-antialiased">Colla Castellera<span class="font-normal text-gray-300"> de </span>Madrid</h1>
        </NuxtLink>
       
      </div>

      <div class="flex items-start  gap-x-4">
        <nav
          id="main-nav"
          class="absolute left-0 top-full w-full bg-black border-b border-white/50 lg:static lg:w-auto lg:border-0 lg:bg-transparent lg:flex"
          :class="menuOpen ? 'block' : 'hidden'"
          @click="menuOpen = false"
        >
          <ul class="flex flex-col lg:flex-row gap-x-6 px-4 lg:px-0 text-white text-sm/6 uppercase subpixel-antialiased">
            <li><NuxtLink to="/calendario">calendario</NuxtLink></li>
            <li><NuxtLink to="/actuaciones">actuaciones</NuxtLink></li>
            <!--
            <li><NuxtLink to="/colla">la colla</NuxtLink></li>
            <li><a href="#contacto">media</a></li>
            -->
            <li><a href="https://collacastellerademadrid.net/pinyator/Apuntat.php?reset=1" target="_blank" class="text-gray-100 italic">pinyator</a></li>

          </ul>
        </nav>

        <button
          class="lg:hidden"
          aria-controls="main-nav"
          :aria-expanded="menuOpen"
          aria-label="Menú"
          @click="menuOpen = !menuOpen"
        >
          <Icon :name="menuOpen ? 'mdi:close' : 'mdi:dots-vertical'" style="color: white" size="21"/>
        </button>
      </div>

    </div>
  </header>
</template>

<script lang="ts" setup>
const showHeader = ref(true);
const lastScrollY = ref(0);
const menuOpen = ref(false);

// Close the mobile menu when the header hides on scroll-down
watch(showHeader, (visible) => {
  if (!visible) menuOpen.value = false;
});

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
    @apply block py-3 lg:py-0 transition-colors duration-200 text-gray-300 hover:text-white font-display;
  }

  nav ul li + li {
    @apply border-t border-white/10 lg:border-0;
  }

  nav ul li a.router-link-active, nav ul li a.router-link-exact-active {
    @apply text-white font-semibold;
  }

</style>