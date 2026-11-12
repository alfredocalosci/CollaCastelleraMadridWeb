<script lang="ts" setup>
    const { data } = await useFetch<{ actuaciones: Actuacion[], castells_list: Castell[], images: Record<string, GalleryImage[]> }>('/api/actuaciones')

    const actuaciones = computed(() => data.value?.actuaciones ?? [])
    const castells_list = computed(() => data.value?.castells_list ?? [])
    const images = computed(() => data.value?.images ?? {})
    const hasImages = (id: Actuacion['id']) => (images.value[id]?.length ?? 0) > 0

    const upcomingActuaciones = computed(() => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return actuaciones.value
            .filter((actuacion) => parseDate(actuacion.fecha) >= today)
            .sort((a, b) => parseDate(a.fecha).getTime() - parseDate(b.fecha).getTime())
    })

    const pastActuacionesByYear = computed(() => {
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
    })

    const openIds = ref(new Set<Actuacion['id']>())
    const isOpen = (id: Actuacion['id']) => openIds.value.has(id)
    const toggle = (id: Actuacion['id']) => {
        const next = new Set(openIds.value)
        if (!next.delete(id)) next.add(id)
        openIds.value = next
    }

    onMounted(() => {
        console.log('Upcoming Actuaciones:', upcomingActuaciones.value)
        console.log('Past Actuaciones by Year:', pastActuacionesByYear.value)
        console.log('Castells list:', castells_list.value)
    })

</script>

<template>
    <div>
        <div class="bg-white">
            <section class="ccm_container pt-24 pb-12 ">
                 <article class="grid grid-cols-1 md:grid-cols-3 px-6 md:px-0">
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
                                
                                <h2 class="font-display font-bold text-2xl/6 min-h-12 tracking-tight">{{ actuacion.nombre }}<span class="text-rosso-500 pl-0.5">.</span>
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
        <section class="py-12 ">

            <template v-for="group in pastActuacionesByYear" :key="group.year">
                <article class="grid grid-cols-1 md:grid-cols-[2fr_3fr_3fr] gap-x-8 ">
                    <h6 class="md:col-start-2 text-gray-600 text-sm mt-8 mb-2 px-6 md:px-0 ">{{ group.year }}</h6>
                </article>

                <template v-for="act in group.items" :key="act.id">
                    <div
                        class="flex flex-col items-start justify-start transition-colors duration-300"
                        :class="{ 'bg-gray-200': isOpen(act.id) && hasImages(act.id) }"
                    >
                        <button
                            type="button"
                            :aria-expanded="isOpen(act.id)"
                            :aria-controls="`gallery-${act.id}`"
                            :disabled="!hasImages(act.id)"
                            :class="hasImages(act.id) ? 'hover:bg-gray-200 hover:pl-12 cursor-pointer' : 'cursor-default'"
                            class="grid grid-cols-1 md:grid-cols-[2fr_3fr_3fr_auto] items-start gap-x-8 py-3 border-t border-white transition-all duration-200 group px-6 w-full text-left"
                            @click="toggle(act.id)"
                        >
                            <h6 class="text-xs/5 text-left md:text-right mb-0 ">{{ formatDate(act.fecha) }}</h6>
    
                            <article>
                                <h2 class="font-display font-bold text-lg/5 tracking-tight">{{ act.nombre }}<span class="text-rosso-500 pl-0.5">.</span>
                                </h2>
                                <h5 class="font-display font-bold text-xs/5 text-rosso-500 uppercase ">
                                    {{ act.ciudad }}
                                </h5>
                            </article>
    
                            <article>
                                
                                <h6 class= " text-base/5">{{ act.castells.replace(/,/g, ', ') }} , {{ act.pilars.replace(/,/g, ', ') }}</h6>
                                <h6 v-if="act.con" class="italic text-sm/5 ">con: {{ act.con }}</h6>
    
                            </article>

                            <UIcon
                                v-if="hasImages(act.id)"
                                name="mdi:chevron-down"
                                class="size-6 text-gray-500 group-hover:text-rosso-500 -order-1 md:order-0 transition-all duration-300"
                            />

                            <div v-else class="w-6 h-6"></div>
                        </button>
    
                        <CustomAccordion v-if="hasImages(act.id)" :id="`gallery-${act.id}`" :open="isOpen(act.id)" class="w-full">
                            <div class="w-full bg-gray-200 py-9">
                                <div class="ccm_containerrr px-6 lg:px-32">
                                    <ImageGrid :images="images[act.id]" />
                                </div>
                            </div>
                        </CustomAccordion>
                    </div>
                </template>


            </template>

        </section>

        <!-- link to un pis mes -->
        <div class="bg-gray-300">
            <section class="ccm_container pt-12 pb-12 flex justify-center">
            <NuxtLink
                    to="/unpismes"
                    class="flex items-center gap-6 group"
                >

                    <UIcon name="ic:outline-bar-chart" class="size-12 group-hover:text-rosso-500 transition-all duration-300" />
                    <div>
                        <h1 class="text-xl/6 uppercase font-display font-bold mt-3 tracking-tight ">Un pis més <span class="text-rosso-500 text-3xl/6">.</span></h1>
                    
                        <p class="text-sm/5 ">la sección de estadísticas de la colla</p>
                    </div>

                    <UIcon name="mdi:arrow-right-thick" class="size-8 text-white group-hover:text-black transition-all duration-300"  />
            </NuxtLink>
            </section>
        </div>

    </div>

</template>


<style scoped>
  @reference "tailwindcss";
  @reference "~/assets/css/main.css";

  .a.stripe p {
    @apply text-sm/5 text-gray-500 mb-0!;
  }
</style>