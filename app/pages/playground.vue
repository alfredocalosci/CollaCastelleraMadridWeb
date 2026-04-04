<template>

  <HomeCarousel />

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
          <img src="/img/cercle-catala-madrid.jpg" alt="cercle català de Madrid" class="w-16 mb-4"/>
          <p class="text-lg/6"><span class="text-sm">una actividad del </span> <br/>Cercle Català de Madrid</p>
        </div>


      </article>


    </div>


  </section>

  <!-- apúntate -->
  <section class="h-screen bg-white grid grid-cols-1 md:grid-cols-[2fr_4fr_3fr_3fr] border-y border-gray-300">
   
    <div class="md:col-start-2 pt-24">
      <h2 class="font-display text-5xl/12 font-bold tracking-tight">ACÉRCATE a<br/>CONOCÉRNOS y<br/>APÚNTATE <span class="text-rosso-500 text-6xl/12">...</span></h2>
    
      <h4 class="font-display text-2xl/6 font-bold pb-4 pt-12">ensayos abiertos</h4>

      <p>Ensayamos dos días a la semana en nuestro local de <strong>Vallecas</strong> en la calle Teniente Muñoz Díaz, 21 - metro L1 Portazgo.</p>

      <p>Los <strong>miércoles</strong> a las <strong>19.00</strong> y los <strong>viernes</strong> a las <strong>19.30</strong>.<br/>
      Los ensayos suelen durar 2 horas.
      </p>

      <p class="text-2xl/7">Para participar a los ensayos no es necesaria ninguna preparación especial ni requisito mínimo.</p>

      <hr class="border-gray-200 my-6"/>

      
    </div>
   
    <div class="flex justify-end items-center md:col-start-4">
      <img src="/img/dotted3.jpg" alt="subiendo" class="h-screen w-auto item-right mix-blend-multiply"/>
    </div>
  </section>

  <!-- image grid -->
  <section class="w-9/12 mx-auto py-24">
    <image-grid />
  </section>

  <!--
  <section class="border-y border-gray-300 py-6">
    <image-carousel />
  </section>
  -->

  <!-- gatos de madrid -->
  <section class="bg-gray-200 py-12 px-6">
    <p>gatos section</p>
    <img src="/img/gato.png" alt="gato blanco" class="w-24 h-auto"/>
  </section>

  <!-- header with logo -->
  <ImageBig src="/img/covers/DSC_0163.JPG" alt="Debod Temple in Madrid" />


</template>

<script lang="ts" setup>



</script>

<style>

</style>