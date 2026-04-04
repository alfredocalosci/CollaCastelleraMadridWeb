<script lang="ts" setup>

</script>

<template>
  
  
        <ImageBig src="/img/covers/debod.jpg" alt="Debod Temple in Madrid" />

      <div class="bg-white">
        <section class="ccm_container pt-24 pb-12">
            <article class="w-full md:w-3/4 mx-auto mb-6">
                <h2 class="text-2xl/6 font-display font-bold pb-2 mt-3 tracking-tight"> Junta Directiva <span class="text-rosso-500 text-3xl/5">.</span></h2>
                <p>Es el órgano, que administra y representa a la colla de acuerdo con los estatutos y con las decisiones de la asamblea general.</p>
            </article>

            <!-- two columns-->
             <div class="grid grid-cols-1 md:grid-cols-2 w-10/12 mx-auto pt-6">
                <!-- first column-->
                <div>
                    <div class="people flex items-center mb-6 font-display">
                        <div class="w-1/4 pr-6">
                            <img src="/img/people/george.jpg" alt="personas" class="w-full h-auto rounded-full "/>
                        </div>
                        

                        <div class="w-3/4">
                            <h4 class="font-light text-xl/6 subpixel-antialiased"><span class="text-gray-500 text-base">presidente</span> <br> Marc <span class="font-semibold">Rosselló</span></h4> 
                        </div>
                    </div>

                    <div class="people flex items-center mb-6 ">
                        <div class="w-1/4 pr-6">
                            <img src="/img/people/george.jpg" alt="personas" class="w-full h-auto rounded-full "/>
                        </div>
                        

                        <div class="w-3/4">
                            <h4>cargo <br> Nombre Apellido</h4> 
                        </div>
                    </div>
                </div>

                <div>
                    <div class="people flex items-center mb-6 ">
                        <div class="w-1/4 pr-6">
                            <img src="/img/people/george.jpg" alt="personas" class="w-full h-auto rounded-full "/>
                        </div>
                        

                        <div class="w-3/4">
                            <h4>cargo <br> Nombre Apellido</h4> 
                        </div>
                    </div>
                </div>

             </div>


        </section>

        <hr class="border-gray-200"/>

        <section class="ccm_container pt-24 pb-12">
            <article class="w-full md:w-3/4 mx-auto mb-6 ">
                <h2 class="text-2xl/6 font-display font-bold pb-2 mt-3 tracking-tight"> Junta Técnica <span class="text-rosso-500 text-3xl/5">.</span></h2>
                <p>Se ocupa de dirigir ensayos y actuaciones, de establecer los criterio técnicos de funcionamiento de la colla y de la formación de sus miembros.</p>
            </article>

            <!-- two columns-->
             <div class="grid grid-cols-1 md:grid-cols-2 w-10/12 mx-auto pt-6">
                <!-- first column-->
                <div>
                    <div class="people flex items-center mb-6 font-display">
                        <div class="w-1/4 pr-6">
                            <img src="/img/people/george.jpg" alt="personas" class="w-full h-auto rounded-full "/>
                        </div>
                        

                        <div class="w-3/4">
                            <h4 class="font-light text-xl/6 subpixel-antialiased"><span class="text-gray-500 text-base">co-cap de colla</span> <br> Marc <span class="font-semibold">Rosselló</span></h4> 
                        </div>
                    </div>

                    <div class="people flex items-center mb-6 ">
                        <div class="w-1/4 pr-6">
                            <img src="/img/people/george.jpg" alt="personas" class="w-full h-auto rounded-full "/>
                        </div>
                        

                        <div class="w-3/4">
                            <h4>cargo <br> Nombre Apellido</h4> 
                        </div>
                    </div>
                </div>

                <div class="bg-gray-100">
                    <div class="people flex items-center mb-6 ">
                        <div class="w-1/4 pr-6">
                            <img src="/img/people/george.jpg" alt="personas" class="w-full h-auto rounded-full "/>
                        </div>
                        

                        <div class="w-3/4">
                            <h4>cargo <br> Nombre Apellido</h4> 
                        </div>
                    </div>
                </div>

             </div>


        </section>

        <hr class="border-gray-200"/>

        <section class="ccm_container pt-24 pb-12">
          
          <article class="grid grid-cols-1 md:grid-cols-3 ">

            <div>
              <h1 class="md:col-span-2 text-xl/6 uppercase font-display font-bold pb-4 mt-3 tracking-tight">La colla <span class="text-rosso-500 text-3xl/6">.</span></h1>

              <p>es una sección del Cercle Català de Madrid </p>

            </div>

            <div class="md:col-span-2">
              <p>side</p>
            </div> 
            
          </article>
        </section>
      </div>

      <div>
        <section class="ccm_container pt-12 pb-24">
            <p>calendario page content</p>
        </section>
      </div>

   


</template>



<style scoped>
  @reference "tailwindcss";
  @reference "~/assets/css/main.css";

  .ccm-calendar :deep(.vc-container) {
    @apply font-display;
  }

  .ccm-calendar :deep(.vc-title) {
    @apply text-3xl/5 uppercase tracking-tight text-gray-400;
  }

  .ccm-calendar :deep(.vc-day-content) {
    @apply text-lg/5 tracking-tight font-bold ;
  }

  .ccm-calendar :deep(.vc-weekdays) {
    @apply mb-6 ;
  }

  .ccm-calendar :deep(.vc-weekday) {
    @apply text-gray-300 ;
  }

  .ccm-calendar :deep(.vc-weekday-1) {
    @apply text-rosso-500 ;
  }

  .ccm-calendar :deep(.vc-weekday-7) {
    @apply text-gray-500;
  }



  /* vc-header styles vc-weekdays */
  .ccm-calendar :deep(.vc-header ) {
    @apply mb-6;
  }

</style>