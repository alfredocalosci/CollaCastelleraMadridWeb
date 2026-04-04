<script lang="ts" setup>
    const { data: actuaciones } = await useFetch<Actuacion[]>('/api/actuaciones')


    const upcomingActuaciones = computed(() => {
        if (!actuaciones.value) return []
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return actuaciones.value
            .filter((actuacion) => parseDate(actuacion.fecha) >= today)
            .sort((a, b) => parseDate(a.fecha).getTime() - parseDate(b.fecha).getTime())
    });

    // a computed function that returns past actuaciones grouped by year, sorted by date
    const pastActuacionesByYear = computed(() => {
        if (!actuaciones.value) return []
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const grouped = actuaciones.value
            .filter((actuacion) => parseDate(actuacion.fecha) < today)
            .sort((a, b) => parseDate(b.fecha).getTime() - parseDate(a.fecha).getTime())
            .reduce((acc, actuacion) => {
                const year = parseDate(actuacion.fecha).getFullYear()
                if (!acc[year]) acc[year] = []
                acc[year].push(actuacion)
                return acc
            }, {} as Record<number, Actuacion[]>)
        return Object.entries(grouped)
            .map(([year, items]) => ({ year: Number(year), items }))
            .sort((a, b) => b.year - a.year)
    });

    onMounted(() => {
        // console.log('All Actuaciones:', actuaciones.value)
        console.log('Upcoming Actuaciones:', upcomingActuaciones.value)
        console.log('Past Actuaciones by Year:', pastActuacionesByYear.value)
    })

</script>

<template>
  

    <div>
        <div class="bg-white">
            <section class="ccm_container pt-24 pb-12">
                 <article class="grid grid-cols-1 md:grid-cols-3 ">
                    <h1 class=" text-xl/6 uppercase font-display font-bold pb-4 mt-3 tracking-tight">Actuaciones <span class="text-rosso-500 text-3xl/6">.</span></h1>

                    <p class="mt-3 uppercase text-sm pt-1 md:col-span-2 text-gray-500">en programación:</p>

                    <!-- grid here -->
                     <div class="md:col-start-2 md:col-span-2 mt-6">
                        <section class="grid grid-col-1 md:grid-cols-3 gap-6">
                            <article
                                v-if="upcomingActuaciones.length > 0"
                                v-for="actuacion in upcomingActuaciones" :key="actuacion.fecha"
                                class="border-t border-gray-300 hover:border-gray-600 transition-colors duration-300 pt-2 group"
                            >
                                <p class="text-sm text-gray-500 group-hover:text-gray-800 transition-colors duration-300">{{ formatDate(actuacion.fecha) }}</p>
                                
                                <h2 class="font-display font-bold text-2xl/6 min-h-12 tracking-tight">{{ actuacion.evento }}<span class="text-rosso-500 pl-0.5">.</span>
                                </h2>

                                <h5 class="font-display font-bold text-sm/6 text-rosso-500 uppercase mb-6 mt-3">
                                    {{ actuacion.ciudad }}
                                </h5>

                                <p v-if="actuacion.con" class="italic text-sm/5">
                                    <span class="text-xs">con</span><br/>{{ actuacion.con }}
                                </p>
                            </article>
                        </section>
                     </div>
                 </article>

            </section>
        </div>


        
    <!--  Past Actuaciones -->
    <section class="py-12">

        <template v-for="group in pastActuacionesByYear" :key="group.year">
            <article class="grid grid-cols-1 md:grid-cols-[2fr_3fr_3fr] gap-x-8">
                <h6 class="md:col-start-2 text-gray-600 text-sm mt-8 mb-2">{{ group.year }}</h6>
            </article>

            <NuxtLink 
                v-for="act in group.items"
                :key="act.id"
                    
                to="#" 
                class="grid grid-cols-1 md:grid-cols-[2fr_3fr_3fr] items-start gap-x-8 py-3 border-t border-white hover:bg-gray-200 hover:pl-12 transition-all duration-200 group"
            >
                <h6 class="text-xs/5 text-right mb-0 ">{{ formatDate(act.fecha) }}</h6>

                <article>
                    <h2 class="font-display font-bold text-lg/5 tracking-tight">{{ act.evento }}<span class="text-rosso-500 pl-0.5">.</span>
                    </h2>
                    <h5 class="font-display font-bold text-xs/5 text-rosso-500 uppercase ">
                        {{ act.ciudad }}
                    </h5>
                </article>

                <article>
                    <h6 v-if="act.con" class="italic text-sm/5 pl-4">con: {{ act.con }}</h6>
                    <h6 v-if="act.resultado" class="text-sm/5"><span class="text-rosso-500 text-base/6 pr-2">›</span> {{ act.resultado }}</h6>
                </article>
            </NuxtLink>
        </template>

    </section>


     <div class="bg-gray-300">
        <section class="ccm_container pt-12 pb-24">
            <p>estadísticas y resumenes</p>
        </section>
     </div>

    </div>

</template>
t


<style scoped>
  @reference "tailwindcss";
  @reference "~/assets/css/main.css";

  .a.stripe p {
    @apply text-sm/5 text-gray-500 mb-0!;
  }
</style>