<template>
  <div class="min-h-screen bg-white pt-12">

    <section class="ccm_container pt-12 pb-6"> 
      <article class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="order-last md:order-first px-6 md:px-0">

          <h1 class="text-xl/6 uppercase font-display font-bold mt-3 tracking-tight">Un pis més <span class="text-rosso-500 text-3xl/6">.</span></h1>
          
          <p class="text-sm/5 ">la sección de estadísticas de la colla</p>

        </div>
      </article>
    </section>

    <section class="w-11/12 mx-auto ">
      
      <article class="w-full flex items-stretch gap-2 mb-3">

        <button
          type="button"
          class="flex items-center justify-center px-2 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400 cursor-pointer"
          :disabled="!canGoPrev"
          aria-label="Años anteriores"
          @click="goPrev"
        >
          <UIcon name="i-heroicons-chevron-left" class="size-5" />
        </button>

        <div class="flex-1 flex gap-6">
          <div
            v-for="yyyy in visibleYears" :key="yyyy"
            class="flex-1 min-w-0 flex flex-col  bg-white text-xs font-display font-bold w-full  aspect-4/3 border-t border-gray-300 py-2"
          >
           
          <span class="pl-1 pb-2"> {{ yyyy }}</span>

              <StreamgraphYearBanded
                class="w-full flex-1 min-h-0"
                :actuaciones="actuacionesByYear.get(yyyy) ?? []"
                :castells-list="castells_list ?? []"
                :filtered-ids="filteredIds"
                :year="yyyy"
                :max-value="maxResultadoValue"
                :reference-value="REFERENCE_VALUE"
                :highlighted="hoveredCastell"
                @hover="hoveredCastell = $event"
              />

             
          </div>
        </div>

        <button
          type="button"
          class="flex items-center justify-center px-2 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400"
          :disabled="!canGoNext"
          aria-label="Años siguientes"
          @click="goNext"
        >
          <UIcon name="i-heroicons-chevron-right" class="size-5 cursor-pointer" />
        </button>

      </article>

      <div class="flex items-center justify-center gap-2 my-6">
        <button
          v-for="yyyy in allYears" :key="yyyy"
          type="button"
          class="rounded-full transition-all cursor-pointer"
          :class="visibleYears.includes(yyyy)
            ? 'size-3 bg-green-800 hover:bg-green-400'
            : 'size-3 bg-gray-300 hover:bg-gray-400'"
          :aria-label="`Ver año ${yyyy}`"
          :aria-current="visibleYears.includes(yyyy) ? 'true' : undefined"
          @click="goToYear(yyyy)"
        />
      </div>

 

    </section>

    <section class="ccm_container mt-12 pb-12"> 
      <p class="uppercase font-display font-light">castells y pilars</p>

      <article
        v-if="castellsWithScores.length > 0"
        class="w-full mt-6 grid grid-cols-1 md:grid-cols-6 gap-4"
      >
        <!-- castell list -->
        <div
          v-for="c in castellsWithScores.filter(c => c.score > 0)" :key="c.nombre"
        >
          <button
            class="relative flex flex-col w-full cursor-pointer group transition-opacity"
            @click="toggleCastell(c.nombre)"
            @mouseenter="hoveredCastell = c.nombre"
            @mouseleave="hoveredCastell = null"
          >
            <!-- filtered background layer (grayscale applies here, not to the bars) -->
            <div
              class="absolute inset-0 transition-[filter] duration-200"
              :class="isDimmed(c.nombre) ? 'grayscale-100 brightness-180' : 'grayscale-0 brightness-100'"
              :style="{ backgroundColor: colorHex(c.score) }"
            ></div>

            <!-- castell header -->
            <div
              class="relative flex items-center justify-between py-1 px-2 font-display transition-[filter] duration-200"
              :class="isDimmed(c.nombre) ? 'grayscale-100 brightness-180' : 'grayscale-0 brightness-100'"
            >
              <span class="text-base font-semibold text-white">{{ c.nombre }}</span>
              <span class="text-xs font-semibold text-emerald-100">
                <template v-if="filtersActive">{{ filteredCountByName.get(c.nombre) ?? 0 }}<span class="opacity-60"> / </span></template>{{ c.count }}
              </span>
            </div>
          </button>

          <!-- mini bar -->
          <div class="relative mt-1 h-0.5 w-full bg-gray-200">
            
            <!-- value line -->
            <div
              class="absolute inset-y-0 left-0"
              :class="isDimmed(c.nombre) ? 'bg-gray-400' : ''"
              :style="{
                width: (c.count / maxCount * 100) + '%',
                ...(isDimmed(c.nombre) ? {} : { backgroundColor: colorHex(c.score) })
              }"
            ></div>
            <!-- selected (filtered) line -->
            <div
              v-if="filtersActive"
              class="absolute inset-y-0 left-0 bg-amber-400 "
              :style="{ width: ((filteredCountByName.get(c.nombre) ?? 0) / maxCount * 100) + '%' }"
            ></div>
          </div>
        </div>

        <!-- toggle: only actuaciones reaching REFERENCE_VALUE -->
        <div>
          <button
            type="button"
            class="flex flex-col w-full cursor-pointer bg-black transition-opacity"
            :class="diadaDe6 ? 'grayscale-0 brightness-100' : 'grayscale-100 brightness-180'"
            :aria-pressed="diadaDe6"
            @click="diadaDe6 = !diadaDe6"
          >
            <div class="flex items-center justify-between py-1 px-2 font-display">
              <span class="text-sm/6 font-semibold text-white ">diada de 6</span>
              <span class="text-xs font-semibold text-white">
                <template v-if="filtersActive">{{ diadaDe6FilteredCount }}<span class="opacity-60"> / </span></template>{{ diadaDe6Count }}
              </span>
            </div>
          </button>

          <!-- mini bar -->
          <div class="relative mt-1 h-0.5 w-full bg-gray-200">
            <!-- value line -->
            <div
              class="absolute inset-y-0 left-0"
              :class="diadaDe6 ? 'bg-black' : 'bg-gray-600'"
              :style="{ width: (diadaDe6Count / (actuacionesAllData.length || 1) * 100) + '%' }"
            ></div>
            <!-- selected (filtered) line -->
            <div
              v-if="filtersActive"
              class="absolute inset-y-0 left-0 bg-amber-400"
              :style="{ width: (diadaDe6FilteredCount / (actuacionesAllData.length || 1) * 100) + '%' }"
            ></div>
          </div>
        </div>

      </article>

      <div v-if="allYears.length" class="mt-12 mx-6 md:mx-0">
        
        <EventDensity
          class="w-full h-16 mb-1"
          :actuaciones="actuaciones"
          :filtered-ids="densityFilteredIds"
          :first-year="allYears[0]!"
          :year-count="allYears.length"
          :range="sliderValue"
        />

        <div class=" -mx-2">
          <USlider v-model="sliderValue" :min="sliderMin" :max="sliderMax" :step="1" color="neutral" size="sm" class=""/>
        </div>

        <div class="flex items-center justify-between text-xs font-display mt-2">
          <span>{{ formatDate(dateFrom.toISOString().slice(0, 10), 'es-ES', { day: undefined }) }}</span>
          

          <span class="text-sm text-gray-500">
            <template v-if="filtersActive">{{ actuacionesFilteredData.length }} / </template>{{ actuacionesAllData.length }} actuaciones
          </span>
          <!--
          <button
            v-if="filtersActive"
            type="button"
            class="uppercase text-rosso-500 cursor-pointer"
            @click="resetFilters"
          >
            quitar filtros
          </button>
          -->

          <span>{{ formatDate(dateToLabel.toISOString().slice(0, 10), 'es-ES', { day: undefined }) }}</span>
        </div>
      </div>

     
    </section>

    <section class="ccm_container mt-12 pb-12 ">
      <template v-for="group in actuacionesAllDataByYear" :key="group.year">

        <article class="grid grid-cols-1 md:grid-cols-[2fr_3fr_3fr_auto] gap-x-8 px-6 md:px-0">
          <h6 class="md:col-start-2 text-gray-600 text-sm mt-8 mb-2">{{ group.year }}</h6>
        </article>

        <div
          v-for="actuacion in group.items"
          :key="actuacion.id"
          class="grid grid-cols-1 md:grid-cols-[2fr_3fr_3fr_auto] items-start gap-x-8 py-3 border-t border-gray-300 px-6 md:px-0"
        >
          <h6 class="text-xs/5 text-right mb-0 ">{{ formatDate(actuacion.fecha) }}</h6>

          <article>
            <h2 class="font-display font-bold text-lg/5 tracking-tight">{{ actuacion.nombre }}<span class="text-rosso-500 pl-0.5">.</span>
            </h2>
            <h5 class="font-display font-bold text-xs/5 text-rosso-500 uppercase ">
              {{ actuacion.ciudad }}
            </h5>
          </article>

          <!-- ({{ item.score }}) -->
          <article>
            <h6
              class="text-sm/5 font-bold font-display text-black"
            >{{ actuacion.resultadoValue }}</h6>
            <h6 class="text-base/5 font-display text-gray-700">
              <span v-for="item in actuacion.resultadoItems" :key="item.name" class="pr-2">
                {{ item.name }} 
              </span>
            </h6>
          </article>

          <UIcon 
            :name="actuacion.resultadoValue >= REFERENCE_VALUE ? 'mdi:radiobox-marked' : 'mdi:radiobox-blank'" 
            class="text-gray-700"
          />
        </div>
      </template>
    </section>

    <section class="ccm_container pt-12 pb-12"> 
      <article class="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div class="order-last md:order-first">

          <h1 class="text-lg/5 uppercase font-display font-bold  tracking-tight">Hemos compartido plaza con <span class="text-rosso-500 text-xl/6">:</span></h1>
          
          <p class="text-sm/5 ">{{ collas.length }} collas</p>
        </div>

        <div class="col-span-2">
          <p>{{ collas.join(', ') }}</p>
        </div>

      </article >
    </section>

  </div>
</template>

<script lang="ts" setup>
  import { scaleSequential, interpolateRgb } from 'd3'

  // minimum reference performance: 3 castells of 6 stages (3d6, 4d6...) plus a pd4
  const REFERENCE_VALUE = 470

  const { data } = await useFetch<{ actuaciones: Actuacion[], castells_list: Castell[], collas: string[] }>('/api/actuaciones')
  const collas = computed(() => data.value?.collas ?? [])

  const actuaciones = computed(() => (data.value?.actuaciones ?? [])
    .filter(a => a.id)
    .map(a => ({ ...a, castells_array: a.castells.split(','), pilars_array: a.pilars.split(',') })) as Actuacion[])

  const castells_list = computed(() => data.value?.castells_list ?? [])

  // uniques values from actuaciones.value.castells_array
  const uniqueCastells = computed(() => {
    if (!actuaciones.value) return []
    const allCastells = actuaciones.value.flatMap(a => a.castells_array)
    return Array.from(new Set(allCastells)).filter(c => c) as string[]
  })  

  // unique pilars
  const uniquePilars = computed(() => {
    if (!actuaciones.value) return []
    const allPilars = actuaciones.value.flatMap(a => a.pilars_array)
    return Array.from(new Set(allPilars)).filter(p => p) as string[]
  })

  // merge uniqueCastells with uniquePilars
  const uniqueCastellsYPilars = computed(() => {
    const castells = uniqueCastells.value.map(c => ({ nombre: c, type: 'castell' }))
    const pilars = uniquePilars.value.map(p => ({ nombre: p, type: 'pilar' }))
    return [...castells, ...pilars]
  })

  // get uniqueCastells with count and scores, ordered by score desc
  const castellsWithScores = computed(() => {
    if (!uniqueCastellsYPilars.value || !castells_list.value) return []
    return uniqueCastellsYPilars.value.map(c => {

      const count = c.type === 'castell'
        ? actuaciones.value?.filter(a => a.castells_array?.includes(c.nombre)).length || 0
        : actuaciones.value?.filter(a => a.pilars_array?.includes(c.nombre)).length || 0

      const castellInfo = castells_list.value?.find(cl => cl.castell === c.nombre)
      const score = castellInfo ? castellInfo.score : 0

      const nombre = c.nombre.toLowerCase()
      const descarregat = score > 0 && !nombre.startsWith('id') && nombre.slice(-1) !== 'c'

      return {
        nombre: c.nombre,
        count,
        score,
        descarregat
      }
    }).sort((a, b) => b.score - a.score)
  })

  watch(castellsWithScores, (value) => {
    if (value.length > 0) console.log('castellsWithScores', value)
  }, { immediate: true })

  // color scale: maps score → shade of green (light = low, dark = high)
  const scoreColorScale = computed(() => {
    const scores = castellsWithScores.value.map(c => c.score).filter(s => s > 0)
    if (!scores.length) return null
    return scaleSequential(interpolateRgb('#064e3b', '#059669')).domain([Math.min(...scores), Math.max(...scores)])
  })

  function colorHex(score: number): string {
    if (!scoreColorScale.value || score <= 0) return '#f3f4f6'
    return scoreColorScale.value(score)
  }

  // returns a Tailwind arbitrary bg class — NOTE: only works if the class
  // is safelisted or used via style binding at runtime (Tailwind can't scan dynamic values)
  function colorBg(score: number): string {
    return `bg-[${colorHex(score)}]`
  }

  // a coumputes array of unique full years from actuaciones.value.fecha
  const yearsWithActuaciones = computed(() => {
    if (!actuaciones.value) return []
    const years = actuaciones.value.map(a => new Date(a.fecha).getFullYear()).filter(y => !isNaN(y))
    return Array.from(new Set(years)).sort((a, b) => a - b)
  })

  const allYears = computed(() => {
    if (!yearsWithActuaciones.value.length) return []
    const min = Math.min(...yearsWithActuaciones.value)
    const max = Math.max(...yearsWithActuaciones.value)
    return Array.from({ length: max - min + 1 }, (_, i) => min + i)
  })

  // sliding 3-year window over allYears, defaulting to the last 3
  // 3 years on desktop (md and up), 1 year on small screens
  const visibleCount = ref(3)
  const windowStartIndex = ref(0)

  onMounted(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const update = () => { visibleCount.value = mq.matches ? 3 : 1 }
    update()
    mq.addEventListener('change', update)
    onBeforeUnmount(() => mq.removeEventListener('change', update))
  })

  // default to the most recent years; also re-anchor when the window size changes
  watch([allYears, visibleCount], ([years, count]) => {
    windowStartIndex.value = Math.max(0, years.length - count)
  }, { immediate: true })

  const visibleYears = computed(() =>
    allYears.value.slice(windowStartIndex.value, windowStartIndex.value + visibleCount.value)
  )

  const canGoPrev = computed(() => windowStartIndex.value > 0)
  const canGoNext = computed(() => windowStartIndex.value + visibleCount.value < allYears.value.length)

  function goPrev() {
    windowStartIndex.value = Math.max(0, windowStartIndex.value - 1)
  }

  function goNext() {
    windowStartIndex.value = Math.min(allYears.value.length - visibleCount.value, windowStartIndex.value + 1)
  }

  // centers the visible window on the given year, clamped to the available range
  function goToYear(yyyy: number) {
    const index = allYears.value.indexOf(yyyy)
    if (index === -1) return
    const half = Math.floor(visibleCount.value / 2)
    const maxStart = Math.max(0, allYears.value.length - visibleCount.value)
    windowStartIndex.value = Math.min(maxStart, Math.max(0, index - half))
  }

  function scoreOf(name: string): number {
    return castells_list.value?.find(cl => cl.castell === name)?.score ?? 0
  }

  // same criteria used for the table's resultado: best 3 scored castells + best scored pilar (max 4 items)
  function bestScoredItems(a: Actuacion) {
    const bestCastells = (a.castells_array ?? [])
      .filter(x => x)
      .map(name => ({ name, score: scoreOf(name) }))
      .filter(item => item.score > 0)
      .sort((x, y) => y.score - x.score)
      .slice(0, 3)

    const bestPilar = (a.pilars_array ?? [])
      .filter(x => x)
      .map(name => ({ name, score: scoreOf(name) }))
      .filter(item => item.score > 0)
      .sort((x, y) => y.score - x.score)
      .slice(0, 1)

    return { bestCastells, bestPilar }
  }

  // groups actuaciones by year for the per-year streamgraphs, castells_array/pilars_array
  // trimmed to the same best-3-castells + best-pilar criteria used for the score
  const actuacionesByYear = computed(() => {
    const map = new Map<number, Actuacion[]>()
    for (const yyyy of allYears.value) map.set(yyyy, [])
    for (const a of actuaciones.value ?? []) {
      const y = parseDate(a.fecha).getFullYear()
      const { bestCastells, bestPilar } = bestScoredItems(a)
      map.get(y)?.push({
        ...a,
        castells_array: bestCastells.map(c => c.name),
        pilars_array: bestPilar.map(p => p.name)
      })
    }
    return map
  })

  // groups actuaciones by year, keeping the full castells_array/pilars_array (no best-3 trim)
  const actuacionesRawByYear = computed(() => {
    const map = new Map<number, Actuacion[]>()
    for (const yyyy of allYears.value) map.set(yyyy, [])
    for (const a of actuaciones.value ?? []) {
      const y = parseDate(a.fecha).getFullYear()
      map.get(y)?.push(a)
    }
    return map
  })

  // slider works in whole months: value k = first day of the k-th month counted from January of the first year,
  // so the range is [dateFrom, dateTo) with dateTo being the first day of the month after the selected one
  const sliderMin = 0
  const sliderMax = computed(() => allYears.value.length * 12)

  const sliderValue = ref<[number, number]>([sliderMin, sliderMax.value])

  watch(sliderMax, (max) => {
    sliderValue.value = [sliderMin, max]
  })

  const monthStart = (k: number) => new Date(Date.UTC((allYears.value[0] ?? 0), k, 1))

  const dateFrom = computed(() => monthStart(sliderValue.value[0]))
  const dateTo = computed(() => monthStart(sliderValue.value[1]))

  // label for the upper handle: last day of the month before the exclusive upper bound
  const dateToLabel = computed(() => new Date(dateTo.value.getTime() - 86400000))

  // data for table
  const actuacionesAllData = computed(() => {
    if (!actuaciones.value) return []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return actuaciones.value.filter(a => parseDate(a.fecha) < today).map(a => {
      const castellsYPilars = [...(a.castells_array ?? []), ...(a.pilars_array ?? [])].filter(x => x)

      const { bestCastells, bestPilar } = bestScoredItems(a)
      const resultadoItems = [...bestCastells, ...bestPilar].sort((x, y) => y.score - x.score)

      const resultadoValue = resultadoItems.reduce((sum, item) => sum + item.score, 0)

      return {
        id: a.id,
        fecha: a.fecha,
        nombre: a.nombre,
        ciudad: a.ciudad,
        castellsYPilars,
        resultadoItems,
        resultadoValue
      }
    })
  })  

  // actuacionesAllData grouped by year, most recent year first
  const actuacionesAllDataByYear = computed(() => {
    const grouped = actuacionesFilteredData.value
      .slice()
      .sort((a, b) => parseDate(b.fecha).getTime() - parseDate(a.fecha).getTime())
      .reduce((acc, actuacion) => {
        const year = parseDate(actuacion.fecha).getFullYear()
        if (!acc[year]) acc[year] = []
        acc[year].push(actuacion)
        return acc
      }, {} as Record<number, typeof actuacionesAllData.value>)
    return Object.entries(grouped)
      .map(([year, items]) => ({ year: Number(year), items }))
      .sort((a, b) => b.year - a.year)
  })

  const selectedCastells = ref<string[]>([])
  const diadaDe6 = ref(false)

  // castell/pilar hovered in the streamgraphs or on its button; temporarily overrides
  // the selection look of the buttons and fades the other colored layers in the streamgraphs
  const hoveredCastell = ref<string | null>(null)

  // a button renders "not selected" (grayscale) when another castell is hovered,
  // or, with nothing hovered, when a selection exists and it isn't part of it
  function isDimmed(nombre: string) {
    if (hoveredCastell.value) return nombre !== hoveredCastell.value
    return selectedCastells.value.length > 0 && !selectedCastells.value.includes(nombre)
  }

  // past actuaciones reaching the reference value, regardless of the other filters
  const diadaDe6Count = computed(() => actuacionesAllData.value.filter(a => a.resultadoValue >= REFERENCE_VALUE).length)

  // actuaciones reaching the reference value that also pass the current filters
  const diadaDe6FilteredCount = computed(() => actuacionesFilteredData.value.filter(a => a.resultadoValue >= REFERENCE_VALUE).length)

  const actuacionesFilteredData = computed(() => {
    return actuacionesAllData.value.filter(a => {
      const fecha = parseDate(a.fecha)
      const inRange = fecha >= dateFrom.value && fecha < dateTo.value
      const inSelection = selectedCastells.value.length === 0
        || selectedCastells.value.every(s => a.castellsYPilars.includes(s))
      const inDiada = !diadaDe6.value || a.resultadoValue >= REFERENCE_VALUE
      return inRange && inSelection && inDiada
    })
  })

  const filteredIds = computed(() => new Set(actuacionesFilteredData.value.map(a => a.id)))

  // EventDensity ids: while a castell is hovered, narrow the current filter to the actuaciones
  // that include it (a preview of what clicking its button would filter)
  const densityFilteredIds = computed(() => {
    const hovered = hoveredCastell.value
    if (!hovered) return filteredIds.value
    return new Set(actuacionesFilteredData.value
      .filter(a => a.castellsYPilars.includes(hovered))
      .map(a => a.id))
  })

  const filtersActive = computed(() =>
    selectedCastells.value.length > 0
    || diadaDe6.value
    || sliderValue.value[0] !== sliderMin
    || sliderValue.value[1] !== sliderMax.value
  )

  function toggleCastell(nombre: string) {
    const i = selectedCastells.value.indexOf(nombre)
    if (i === -1) selectedCastells.value.push(nombre)
    else selectedCastells.value.splice(i, 1)
  }

  function resetFilters() {
    selectedCastells.value = []
    diadaDe6.value = false
    sliderValue.value = [sliderMin, sliderMax.value]
  }

  // filtered count per castell/pilar name, for the button mini bars
  const filteredCountByName = computed(() => {
    const map = new Map<string, number>()
    for (const a of actuacionesFilteredData.value) {
      for (const n of new Set(a.castellsYPilars)) map.set(n, (map.get(n) ?? 0) + 1)
    }
    return map
  })

   // get max value for score in castellsWithScores
  const maxScore = computed(() => {
    if (!castellsWithScores.value) return 0
    return Math.max(...castellsWithScores.value.map(c => c.score))
  });

  // get max value for resultadoValue in actuacionesAllData
  const maxResultadoValue = computed(() => {
    if (!actuacionesAllData.value) return 0
    return Math.max(...actuacionesAllData.value.map(a => a.resultadoValue))
  })  

  // get max value for count in castellsWithScores
  const maxCount = computed(() => {
    if (!castellsWithScores.value) return 0
    return Math.max(...castellsWithScores.value.map(c => c.count))
  })

</script>

<style>

</style>