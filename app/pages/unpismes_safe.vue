<template>
  <div class="min-h-screen bg-white pt-12">

    <section class="ccm_container pt-12 pb-6"> 
      <article class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="order-last md:order-first">

          <h1 class="text-xl/6 uppercase font-display font-bold mt-3 tracking-tight">Un pis més <span class="text-rosso-500 text-3xl/6">.</span></h1>
          
          <p class="text-sm/5 ">la sección de estadísticas de la colla</p>

        </div>
      </article>
    </section>

    <section class="w-11/12 mx-auto ">
      
       <article class="w-full flex items-stretch gap-2 mb-3">

        <button
          type="button"
          class="flex items-center justify-center px-2 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400"
          :disabled="!canGoPrev"
          aria-label="Años anteriores"
          @click="goPrev"
        >
          <UIcon name="i-heroicons-chevron-left" class="size-5" />
        </button>

        <div class="flex-1 flex gap-1">
          <div
            v-for="yyyy in visibleYears" :key="yyyy"
            class="flex-1 flex flex-col py-1 bg-gray-100 text-xs font-display font-bold w-full border-t border-gray-300 h-60">
             <span class="pl-1 pb-2"> {{ yyyy }}</span>

              <StreamgraphYear
                class="w-full flex-1 min-h-0"
                :actuaciones="actuacionesByYear.get(yyyy) ?? []"
                :castells-list="castells_list ?? []"
                :year="yyyy"
                :max-value="maxResultadoValue"
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

      <div class="flex items-center justify-center gap-2 mb-6">
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
        <button
          v-for="c in castellsWithScores.filter(c => c.score > 0)" :key="c.nombre"
          class="flex flex-col gap-1 cursor-pointer group transition-opacity"
          :class="selectedCastells.length > 0 && !selectedCastells.includes(c.nombre) ? 'opacity-40' : 'opacity-100'"
          :style="{ backgroundColor: colorHex(c.score) }"
          @click="selectedCastells.includes(c.nombre) ? selectedCastells.splice(selectedCastells.indexOf(c.nombre), 1) : selectedCastells.push(c.nombre)"
        >
          <div class="flex items-center justify-between pt-1 px-2 font-display">
            <span class="text-base font-semibold text-white">{{ c.nombre }}</span>
            <span class="text-xs font-semibold text-emerald-200">{{ c.count }}</span>
          </div>
          
         <div
          class="h-1  w-full "
           :style="{ backgroundColor: colorHex(c.score) }"
        >
            <div class="h-1 bg-amber-500 " :style="{ width: (c.count / maxCount * 100) + '%' }"
            ></div>
         </div>

        </button>

      </article>

      <article class="flex gap-1 mt-6">
        <!-- one streamgraph per year, sharing the y-scale amplitude -->
        <div
          v-for="yyyy in allYears" :key="yyyy"
          class="flex-1 h-18 border-t border-gray-300"
           :class="visibleYears.includes(yyyy)
            ? ' bg-white'
            : ' bg-gray-100'"
        >
          <StreamgraphYear
            class="w-full h-full"
            :actuaciones="actuacionesRawByYear.get(yyyy) ?? []"
            :castells-list="castells_list ?? []"
            :year="yyyy"
            :max-value="maxResultadoValue"
          />
        </div>
      </article>

      <aside class="mt-6">
        <USlider
          v-model="sliderValue"
          color="neutral"
          :min="sliderMin"
          :max="sliderMax"
          :step="7"
          :min-steps-between-thumbs="7"
          size="sm"
          :ui="{ thumb: 'ring-4' }"
        />

        <div class="flex justify-between text-xs text-gray-500 mt-3">
          <span>{{ formatDate(dateFrom.toISOString().split('T')[0] ?? '') }}</span>
          <span>{{ formatDate(dateTo.toISOString().split('T')[0] ?? '') }}</span>
        </div>
      </aside>
    </section>

     <section class="ccm_container mt-12 pb-12 "> 
       <!-- render actuacionesAllData as simple table -->
          <table class="min-w-full mt-6">
            <thead>
              <tr class="border-b border-gray-400 text-xs">
                <th class="text-left py-2 ">Fecha</th>
                <th class="text-left py-2 ">Nombre</th>
                <th class="text-left py-2 ">Ciudad</th>
                <th class="text-left py-2 ">Top 3</th>
                <th class="text-right py-2 ">Resultado</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="actuacion in actuacionesAllData" :key="actuacion.id"
                class="border-b border-gray-300"
              >

                <td class=" py-2  text-xs">{{ formatDate(actuacion.fecha) }}</td>
                <td class=" py-2 ">{{ actuacion.nombre }} <br/>
                 <span v-for="item in actuacion.resultadoItems" :key="item.name" class="text-xs text-gray-500 pr-2">
                    {{ item.name }} 
                  </span>
                </td>

                <td class=" py-2 text-xs">{{ actuacion.ciudad }}</td>
                
                <td class=" py-2 ">
                  <span v-for="item in actuacion.resultadoItems" :key="item.name" class="block">
                    {{ item.name }} ({{ item.score }})
                  </span>
                </td>
                <td class=" py-2  font-bold text-right">{{ actuacion.resultadoValue }}</td>
              </tr>
            </tbody>
          </table>
    </section>

    <section class="ccm_container pt-12 pb-12"> 
      <article class="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div class="order-last md:order-first">

          <h1 class="text-lg/5 uppercase font-display font-bold  tracking-tight">Hemos compartido plaza con <span class="text-rosso-500 text-xl/6">:</span></h1>
          
          <p class="text-sm/5 ">la sección de estadísticas de la colla</p>
        </div>

        <div class="col-span-2">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Donec et mollis dolor. Praesent et diam eget libero egestas mattis sit amet vitae augue. Nam tincidunt congue enim, ut porta lorem lacinia consectetur.</p>
        </div>

      </article >

    

      
    </section>


  </div>
</template>

<script lang="ts" setup>
  import { scaleSequential, interpolateRgb } from 'd3'

  const { data } = await useFetch<{ actuaciones: Actuacion[], castells_list: Castell[] }>('/api/actuaciones')

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
  const VISIBLE_YEARS_COUNT = 3
  const windowStartIndex = ref(0)

  watch(allYears, (years) => {
    windowStartIndex.value = Math.max(0, years.length - VISIBLE_YEARS_COUNT)
  }, { immediate: true })

  const visibleYears = computed(() =>
    allYears.value.slice(windowStartIndex.value, windowStartIndex.value + VISIBLE_YEARS_COUNT)
  )

  const canGoPrev = computed(() => windowStartIndex.value > 0)
  const canGoNext = computed(() => windowStartIndex.value + VISIBLE_YEARS_COUNT < allYears.value.length)

  function goPrev() {
    windowStartIndex.value = Math.max(0, windowStartIndex.value - 1)
  }

  function goNext() {
    windowStartIndex.value = Math.min(allYears.value.length - VISIBLE_YEARS_COUNT, windowStartIndex.value + 1)
  }

  // centers the visible window on the given year, clamped to the available range
  function goToYear(yyyy: number) {
    const index = allYears.value.indexOf(yyyy)
    if (index === -1) return
    const half = Math.floor(VISIBLE_YEARS_COUNT / 2)
    const maxStart = Math.max(0, allYears.value.length - VISIBLE_YEARS_COUNT)
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

  const toDay = (d: Date) => Math.floor(d.getTime() / 86400000)
  const fromDay = (n: number) => new Date(n * 86400000)

  const sliderMin = computed(() => {
    if (!allYears.value.length) return 0
    return toDay(new Date(allYears.value[0]!, 0, 1))
  })

  const sliderMax = computed(() => {
    if (!allYears.value.length) return 0
    return toDay(new Date(allYears.value[allYears.value.length - 1]!, 11, 31))
  })

  const sliderValue = ref<[number, number]>([sliderMin.value, sliderMax.value])

  watch([sliderMin, sliderMax], ([min, max]) => {
    sliderValue.value = [min, max]
  })

  const dateFrom = computed(() => fromDay(sliderValue.value[0]))
  const dateTo = computed(() => fromDay(sliderValue.value[1]))

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

  const selectedCastells = ref<string[]>([])

  const actuacionesFilteredData = computed(() => {
    return actuacionesAllData.value.filter(a => {
      const fecha = parseDate(a.fecha)
      const inRange = fecha >= dateFrom.value && fecha <= dateTo.value
      const inSelection = selectedCastells.value.length === 0
        || selectedCastells.value.some(s => a.castellsYPilars.includes(s))
      return inRange && inSelection
    })
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

  // data for streamgraph
  

 

  

</script>

<style>

</style>