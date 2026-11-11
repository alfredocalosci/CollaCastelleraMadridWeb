<template>
  <div ref="containerRef" class="w-full h-full">
    <svg
      v-if="width > 0 && height > 0"
      :width="width"
      :height="height"
      :viewBox="`0 0 ${width} ${height}`"
      preserveAspectRatio="none"
    >

      <!-- 0 value horizontal line-->
      <line
        x1="0"
        :x2="width"
        :y1="yScale(0)"
        :y2="yScale(0)"
        stroke="#333"
        stroke-width="1"
  
      />

      <!--  events vertical lines 
       <line
        v-for="d in eventDates"
        :key="d.date.getTime()"
        :x1="xScale(d.date)"
        :x2="xScale(d.date)"
        y1="0"
        :y2="height"
        stroke="#fff"
        stroke-width="1"
        opacity="1"
        :stroke-dasharray="d.hasScore ? undefined : '4 4'"
      />
      -->

      <!-- y scale ticks lines -->
      <line
        v-for="tick in yScale.ticks(8)"
        :key="tick"
        x1="0"
        :x2="width"
        :y1="yScale(tick)"
        :y2="yScale(tick)"
        stroke="#fff"
        stroke-width="1.5"
        opacity="1"
        stroke-dasharray="2 2"
      />  

      <!-- events dots -->
      <circle
        v-for="d in eventDates"
        :key="d.date.getTime()"
        :cx="xScale(d.date)"
        cy="2"
        r="2"
        :fill="d.hasScore ? '#333' : '#ccc'"
      />
      
      <path
        v-for="layer in layers"
        :key="layer.key"
        :d="layer.path ?? ''"
        :fill="layer.color"
        stroke="none"
      />

     
    </svg>
  </div>
</template>

<script lang="ts" setup>
  import {
    scaleTime,
    scaleLinear,
    scaleSequential,
    interpolateRgb,
    stack as d3Stack,
    stackOrderNone,
    stackOffsetNone,
    area as d3Area,
    curveBasis,
    curveBumpX,
    curveMonotoneX,
    curveCatmullRom
  } from 'd3'

  const props = defineProps<{
    actuaciones: Actuacion[]
    castellsList: Castell[]
    year: number
    // shared y-scale amplitude across all year instances, so every year plots on the same scale
    maxValue: number
  }>()

  // responsive sizing: measure the parent-provided container, drive svg width/height/viewBox from it
  const containerRef = ref<HTMLElement | null>(null)
  const width = ref(0)
  const height = ref(0)
  let resizeObserver: ResizeObserver | null = null

  onMounted(() => {
    if (!containerRef.value) return
    resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      width.value = entry.contentRect.width
      height.value = entry.contentRect.height
    })
    resizeObserver.observe(containerRef.value)
  })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
  })

  // same color formula as the castellsWithScores buttons, driven by castellsList so both stay in sync
  const colorScale = computed(() => {
    const scores = props.castellsList.map(c => c.score).filter(s => s > 0)
    if (!scores.length) return null
    return scaleSequential(interpolateRgb('#064e3b', '#059669')).domain([Math.min(...scores), Math.max(...scores)])
  })

  function colorHex(score: number): string {
    if (!colorScale.value || score <= 0) return '#f3f4f6'
    return colorScale.value(score)
  }

  function scoreOf(nombre: string): number {
    return props.castellsList.find(c => c.castell === nombre)?.score ?? 0
  }

  // sum of scores across an actuación's castells + pilars, used to drop empty-result actuaciones from the area shapes
  function totalScore(a: Actuacion): number {
    let total = 0
    for (const c of a.castells_array ?? []) if (c) total += scoreOf(c)
    for (const p of a.pilars_array ?? []) if (p) total += scoreOf(p)
    return total
  }

  // castells + pilars performed this year, scored, ordered highest score first (bottom of the stack)
  const categories = computed(() => {
    const names = new Set<string>()
    for (const a of props.actuaciones) {
      for (const c of a.castells_array ?? []) if (c) names.add(c)
      for (const p of a.pilars_array ?? []) if (p) names.add(p)
    }
    return Array.from(names)
      .map(nombre => ({ nombre, score: scoreOf(nombre) }))
      .filter(c => c.score > 0)
      .sort((a, b) => b.score - a.score)
  })

  // domain edges: a single calendar year when props.year is set (per-year usage), or the actual
  // min/max dates across all actuaciones when props.year is 0 (aggregate "all years" usage)
  const domainStart = computed(() => {
    if (props.year > 0) return new Date(props.year, 0, 1)
    const times = props.actuaciones.map(a => parseDate(a.fecha).getTime()).filter(t => !isNaN(t))
    return times.length ? new Date(Math.min(...times)) : new Date()
  })

  const domainEnd = computed(() => {
    if (props.year > 0) return new Date(props.year, 11, 31)
    const times = props.actuaciones.map(a => parseDate(a.fecha).getTime()).filter(t => !isNaN(t))
    return times.length ? new Date(Math.max(...times)) : new Date()
  })

  // one point per actuación date, zero-padded at the domain edges so the stream tapers at the edges;
  // the trailing edge is today instead of the domain end when today falls within the domain, so the curve reaches 0 there
  const streamData = computed(() => {
    const zeroRow = () => Object.fromEntries(categories.value.map(c => [c.nombre, 0])) as Record<string, number>

    const today = new Date()
    const yearStart = domainStart.value
    const yearEnd = domainEnd.value
    const trailingEdge = today >= yearStart && today <= yearEnd ? today : yearEnd

    const byDate = new Map<number, Record<string, number>>()
    for (const a of props.actuaciones) {
      if (totalScore(a) === 0) continue
      const d = parseDate(a.fecha)
      if (isNaN(d.getTime())) continue
      if (d > today) continue
      const t = d.getTime()
      const row = byDate.get(t) ?? zeroRow()
      for (const c of a.castells_array ?? []) {
        if (!c || !(c in row)) continue
        row[c] = (row[c] ?? 0) + scoreOf(c)
      }
      for (const p of a.pilars_array ?? []) {
        if (!p || !(p in row)) continue
        row[p] = (row[p] ?? 0) + scoreOf(p)
      }
      byDate.set(t, row)
    }

    const points = Array.from(byDate.entries())
      .sort(([a], [b]) => a - b)
      .map(([t, row]) => ({ date: new Date(t), ...row }))

    return [
      { date: yearStart, ...zeroRow() },
      ...points,
      { date: trailingEdge, ...zeroRow() }
    ]
  })

  const xScale = computed(() => {
    return scaleTime()
      .domain([domainStart.value, domainEnd.value])
      .range([0, width.value])
  })

  // unique actuación dates this year, marked as gridlines on the x scale; dashed when that day's total score is 0
  const eventDates = computed(() => {
    const scoreByTime = new Map<number, number>()
    for (const a of props.actuaciones) {
      const d = parseDate(a.fecha)
      if (isNaN(d.getTime())) continue
      const t = d.getTime()
      scoreByTime.set(t, (scoreByTime.get(t) ?? 0) + totalScore(a))
    }
    return Array.from(scoreByTime.entries())
      .sort(([a], [b]) => a - b)
      .map(([t, score]) => ({ date: new Date(t), hasScore: score > 0 }))
  })

  const stackedSeries = computed(() => {
    if (!categories.value.length || !streamData.value.length) return []
    const stackGen = d3Stack<Record<string, any>>()
      // reversed so the lowest score sits at the bottom of the stack and the highest at the top
      .keys(categories.value.map(c => c.nombre).reverse())
      .order(stackOrderNone)
      .offset(stackOffsetNone)
    return stackGen(streamData.value)
  })

  // 0-baseline domain shared across all year instances: 0 always sits at the bottom
  const yScale = computed(() => {
    return scaleLinear().domain([0, props.maxValue * 1.1]).range([height.value, 0])
  })

  const layers = computed(() => {
    if (!width.value || !height.value) return []
    const areaGen = d3Area<any>()
      .x(d => xScale.value(d.data.date))
      .y0(d => yScale.value(d[0]))
      .y1(d => yScale.value(d[1]))
      .curve(curveBumpX)

    return stackedSeries.value.map(series => {
      const category = categories.value.find(c => c.nombre === series.key)
      return {
        key: series.key,
        color: colorHex(category?.score ?? 0),
        path: areaGen(series as any)
      }
    })
  })
</script>
