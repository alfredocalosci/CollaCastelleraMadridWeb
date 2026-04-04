<template>
   <footer class="bg-black text-white pb-60 pt-12">
    <div class="ccm_container grid md:grid-cols-3 gap-x-6 ">

      <div class="flex items-center gap-x-6">
        <img 
          v-gsap.whenVisible.fromTo="[{ scale: 0 }, { scale: 1 }]" src="/img/CCM_solo.png"
          alt="Colla Castellera de Madrid logo"
          class=" mb-4 w-20 h-auto"
        />
        <h1 class="font-display font-bold text-white text-base/5 subpixel-antialiased">Colla Castellera<br/><span class="font-light"> de </span>Madrid</h1>
      </div>

      <p class="subpixel-antialiased mt-6">
          <a href="mailto:info@collacastellerademadrid.net">info@collacastellerademadrid.net</a> <br/>
          + 34 915 41 60 90
      </p>

      <div>
        <p class="text-sm text-right subpixel-antialiased opacity-70">síguenos en:</p>
        <div class="flex gap-x-2 justify-end">

          <a v-for="rrss in RRSS" :key="rrss.name" :href="rrss.url" target="_blank" rel="noopener noreferrer">
            <Icon :name="rrss.icon" style="color: white" size="36"/>
          </a>

        </div>
      </div>

    </div>
    
  </footer>
</template>

<script lang="ts" setup>
import { icon } from '#build/ui/prose';


  const RRSS = [
    { name: 'instagram',
      url: 'https://www.instagram.com/collacastelleramadrid/',
      icon: 'mdi:instagram',
    },
   
    {
      name: 'tiktok',
      url: 'https://www.tiktok.com/@gatosdemadrid',
      icon: 'ic:baseline-tiktok',
    },
     { name: 'youtube',
      url: 'https://www.youtube.com/channel/UCzbODGWAommb51t1vzetE1Q', 
      icon: 'mdi:youtube' },
    { name: 'facebook',
      url: 'https://www.facebook.com/collacastellerademadrid/', 
      icon: 'mdi:facebook' },
   
   
     { name: 'twitter',
      url: 'https://twitter.com/CCastelleraMAD',
      icon: 'mdi:twitter',
    },
  ]

  /*
   { name: 'linkedin',
      url: 'https://www.linkedin.com/company/colla-castellera-de-madrid/',
      icon: 'mdi:linkedin' 
    },
    */

</script>

<style>

</style>