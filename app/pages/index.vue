<template>

  <HomeCarousel :slides="portada ?? undefined" />

  <!-- los castells -->
  <section class="ccm_container pt-24 pb-12">
    <div class="grid md:grid-cols-2 gap-x-24 mx-8">
      
      <h1 class="md:col-span-2 text-3xl/6 uppercase font-display font-bold pb-4 tracking-tight">Los castells <span class="text-rosso-500 text-5xl/6">.</span></h1>

      <article >
        <p>Los <em>Castells</em> son una tradición catalana desde hace más de 300 años y ha tenido un gran auge en los últimos años y cuenta con más de 100 <em>collas</em> repartidas no solo en el ámbito de Cataluña, sino en lugares tan exóticos como China, Australia, Chile, Argentina o lugares más cercanos como Londres, París o Bruselas.</p>

        <p>No es esta una actividad cualquiera, pues transmite unos valores de solidaridad, de esfuerzo individual y colectivo y especialmente de integración que permiten que formen parte de las collas desde gente que lleva toda la vida en un pueblo o ciudad, hasta gente llegada de la emigración de otras regiones o países, en perfecta armonía, siendo en la mayoría de los casos familias enteras y gente de todas las edades, desde niños pequeños a gente mayor, las que forman parte de cada colla.</p>
      </article>
      <article >
        
        <p>Forman parte de la <em>Colla</em> personas de distintas edades, sexo y orígenes aplicando los valores del mundo casteller: <em>Força, Equilibri, Valor i Seny</em> (Fuerza, Equilibrio, Valor y Prudencia o Sentido Común).</p>

        <p>La UNESCO declaró los <em>castells</em> como Patrimonio Inmaterial de la Humanidad el 16 de Noviembre de 2010.</p>

        <hr class="my-6 border-gray-300"/>

        <p>La <strong>Colla Castellera de Madrid</strong> se constituyó el 21 de enero de 2017 como sección del Cercle Català de Madrid, entidad que lleva más de 60 años desarrollando sus actividades de fomento de la cultura catalana para aproximarla a Madrid.</p>

        <hr class="my-6 border-gray-300"/>

        <div class="flex gap-x-6 items-start">
          <a href="https://cerclecatala-madrid.net/" target="_blank" rel="noopener noreferrer">
            <img src="/img/cercle-catala-madrid.jpg" alt="cercle català de Madrid" class="w-16 mb-4"/>
          </a>

          <p class="text-lg/6"><span class="text-sm">una actividad del </span> <br/><a href="https://cerclecatala-madrid.net/" target="_blank" rel="noopener noreferrer">Cercle Català de Madrid</a></p>
        </div>


      </article>


    </div>


  </section>

  <!-- apúntate -->
  <section class="lg:min-h-screen bg-white grid grid-cols-1 md:grid-cols-[2fr_4fr_3fr_3fr] border-y border-gray-300 px-6 md:px-0 ">
   
    <div class="md:col-start-2 pt-24 ">
      <h2 class="font-display text-5xl/12 font-bold tracking-tight">ACÉRCATE a<br/>CONOCÉRNOS y<br/>APÚNTATE <span class="text-rosso-500 text-6xl/12">...</span></h2>
    
      <h4 class="font-display text-2xl/6 font-bold pb-4 pt-12">ensayos abiertos</h4>

      <p>Ensayamos dos días a la semana en nuestro local de <strong>Vallecas</strong> en la calle Teniente Muñoz Díaz, 21 - metro L1 Portazgo.</p>

      <p>Los <strong>miércoles</strong> a las <strong>19.00</strong> y los <strong>viernes</strong> a las <strong>19.30</strong>.<br/>
      Los ensayos suelen durar 2 horas.
      </p>

      <p class="text-2xl/7 ">Para participar a los ensayos no es necesaria ninguna preparación especial ni requisito mínimo.</p>

      <hr class="border-gray-200 my-6"/>

      <p>Para mas información contáctanos <a href="mailto:info@collacastellerademadrid.net" class="text-black underline underline-offset-3 decoration-rosso-500">info@collacastellerademadrid.net</a></p>

      <!-- coordinadora internacional -->

    </div>
   
    <div class="hidden md:flex justify-end items-center md:col-start-4">
      <img src="/img/dotted3.jpg" alt="subiendo" class="h-full w-auto max-w-full object-cover object-right mix-blend-multiply"/>
    </div>

  </section>

  <!-- image grid -->
  <section class="w-full  bg-black py-1">
    <image-grid-full :images="galeria ?? undefined" />
  </section>

  <!-- gatos de madrid -->
  <section class=" bg-gray-200 pb-12 pt-24 px-6">

    <article class="ccm_container">
      <div class="grid md:grid-cols-3 gap-x-12 mx-8">

        <div class="font-display flex flex-col justify-between mb-6">
            
            <div>
              <img src="/img/gato.png" alt="gato blanco" class="w-18 h-auto"/>
              <p class="border-t border-gray-300 pt-1 mt-2 text-gray-400">Gatos de Madrid</p>
            </div>

            <UButton
              to="https://collacastellerademadrid.net/pinyator/Apuntat.php?reset=1"
              target="_blank" rel="noopener noreferrer"
              icon="mdi:arrow-top-right-thick"
              :ui="{ base: 'rounded-none' }"
              size="xl"
              class="bg-rosso-500 hover:bg-black transition-colors duration-300 text-white  shadow-lg w-full uppercase font-display cursor-pointer mb-12 md:mb-0"
            >APÚNTATE EN PINYATOR</UButton>
        </div>

        <!-- ensayo next-->
        <div v-if="proximoEnsayo" class="bg-white py-2 px-4 shadow-xl text-right -rotate-2 mb-6">
          <p class="border-b border-gray-300 pb-1 mt-2 text-sm uppercase font-display text-center text-rosso-500">próximo ensayo:</p>
          <h1 class="font-bold font-display text-6xl">{{ formatDate(proximoEnsayo.fecha, 'es-ES', { day: 'numeric', month: undefined, year: undefined }) }}</h1>
          <h4 class="font-display">{{ formatDate(proximoEnsayo.fecha, 'es-ES', { day: undefined, month: 'long', year: undefined }) }} <br/><span class="text-gray-400">{{ formatDate(proximoEnsayo.fecha, 'es-ES', { day: undefined, month: undefined, year: 'numeric' }) }}</span></h4>
          <hr class="my-6 border-gray-300"/>
          <p class="font-bold font-display">{{ proximoEnsayo.nombre }}</p>
          <p class="text-sm">
            <span>{{ proximoEnsayo.ciudad }}</span><br/>
            <span>{{ proximoEnsayo.lugar?.trim().toLowerCase() === 'local' ? 'calle Teniente Muñoz Díaz, 21' : proximoEnsayo.lugar }}</span><br/>{{ proximoEnsayo.hora }} horas</p>
        </div>

        <!-- actuacion next -->
        <div v-if="proximaActuacion" class="bg-white py-2 px-4 shadow-xl text-right -rotate-2">
          <p class="border-b border-gray-300 pb-1 mt-2 text-sm uppercase font-display text-center text-rosso-500">próxima actuación:</p>
          <h1 class="font-bold font-display text-6xl">{{ formatDate(proximaActuacion.fecha, 'es-ES', { day: 'numeric', month: undefined, year: undefined }) }}</h1>
          <h4 class="font-display">{{ formatDate(proximaActuacion.fecha, 'es-ES', { day: undefined, month: 'long', year: undefined }) }} <br/><span class="text-gray-400">{{ formatDate(proximaActuacion.fecha, 'es-ES', { day: undefined, month: undefined, year: 'numeric' }) }}</span></h4>
          <hr class="my-6 border-gray-300"/>
          <p v-if="proximaActuacion.tipo === 'actuación'" class="font-bold font-display">{{ proximaActuacion.nombre }}</p>
          <p class="text-sm">
            <span>{{ proximaActuacion.ciudad }}</span><br/>
            <span>{{ proximaActuacion.lugar }}</span><br/>{{ proximaActuacion.hora }} horas</p>
        </div>
      </div>

    </article>

    

  </section>

  <div class="bg-gray-200 ">
    <img src="/img/gallery/manos.jpg" alt="castell" class="w-full h-auto mix-blend-multiply"/>
  </div>

</template>

<script lang="ts" setup>
  usePageSeo('home')

  const { data: portadaData } = await useFetch<CarouselSlide[]>('/api/portada')
  const portada = portadaData

  const { data: galeriaData } = await useFetch<GalleryImage[]>('/api/galeria')
  const galeria = galeriaData


  const { data: calendario } = await useFetch<CalendarEvent[]>('/api/calendario')

  // fecha is ISO (YYYY-MM-DD), so string comparison against today's local day works
  const today = new Date().toLocaleDateString('sv-SE')
  const proximo = (...tipos: string[]) => (calendario.value ?? [])
    .filter(e => tipos.includes(e.tipo) && e.fecha >= today)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))[0]
  const proximoEnsayo = computed(() => proximo('ensayo', 'ensayo especial'))
  const proximaActuacion = computed(() => proximo('actuación'))

</script>

<style>

</style>