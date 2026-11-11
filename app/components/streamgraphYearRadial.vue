<template>
  <div ref="containerRef" class="w-full h-full">
    <svg
      v-if="width > 0 && height > 0"
      :width="width"
      :height="height"
      :viewBox="`0 0 ${width} ${height}`"
      preserveAspectRatio="xMidYMid meet"
    >
      <g :transform="`translate(${cx}, ${cy})`">

        <!-- 0 value circle (inner radius) -->
        <circle
          :r="innerRadius"
          fill="none"
          stroke="#333"
          stroke-width="1"
        />

        <!-- y scale ticks, now concentric circles -->
        <circle
          v-for="tick in yScale.ticks(8)"
          :key="tick"
          :r="yScale(tick)"
          fill="none"
          stroke="#fff"
          stroke-width="1.5"
          opacity="1"
          stroke-dasharray="2 2"
        />

        <!-- events dots, placed on the inner radius circle at their date's angle 
        <circle
          v-for="d in eventDates"
          :key="d.date.getTime()"
          :cx="dotX(d.date)"
          :cy="dotY(d.date)"
          r="2"
          :fill="d.hasScore ? '#333' : '#ccc'"
        />
        -->

        <path
          v-for="layer in layers"
          :key="layer.key"
          :d="layer.path ?? ''"
          :fill="layer.color"
          stroke="none"
        />

      </g>
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
    lineRadial as d3LineRadial,
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

  // center of the svg, and the overall radius budget: half of the smaller svg dimension
  const cx = computed(() => width.value / 2)
  const cy = computed(() => height.value / 2)
  const radius = computed(() => Math.min(width.value, height.value) / 2)

  // inner third is left empty (clock face hole), outer two thirds carry the stacked diagram
  const innerRadius = computed(() => radius.value / 5)
  const outerRadius = computed(() => radius.value)

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

  // time -> angle, clockwise from 12 o'clock (angle 0 = up, matching d3's radial convention)
  const angleScale = computed(() => {
    return scaleTime()
      .domain([domainStart.value, domainEnd.value])
      .range([0, 2 * Math.PI])
  })

  // unique actuación dates this year, marked as gridlines on the angle scale; dashed when that day's total score is 0
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

  function dotX(date: Date): number {
    return innerRadius.value * Math.sin(angleScale.value(date)) * 0.75
  }

  function dotY(date: Date): number {
    return -innerRadius.value * Math.cos(angleScale.value(date)) * 0.75
  }

  const stackedSeries = computed(() => {
    if (!categories.value.length || !streamData.value.length) return []
    const stackGen = d3Stack<Record<string, any>>()
      // reversed so the lowest score sits at the bottom of the stack and the highest at the top
      .keys(categories.value.map(c => c.nombre).reverse())
      .order(stackOrderNone)
      .offset(stackOffsetNone)
    return stackGen(streamData.value)
  })

  // 0-baseline domain shared across all year instances: 0 always sits at the inner radius
  const yScale = computed(() => {
    return scaleLinear().domain([0, props.maxValue * 1.1]).range([innerRadius.value, outerRadius.value])
  })

  const layers = computed(() => {
    if (!width.value || !height.value) return []

    // outer and inner boundaries are built as two independent curves rather than a single
    // d3.areaRadial() curve: areaRadial smooths across the seam where the outer boundary
    // (forward) meets the inner boundary (reversed), which pulls a constant inner radius
    // (the 0-value edge) off a perfect circle. Generating each boundary on its own,
    // homogeneous point sequence keeps a constant boundary exactly circular.
    const outerLine = d3LineRadial<any>()
      .angle(d => angleScale.value(d.data.date))
      .radius(d => yScale.value(d[1]))
      .curve(curveCatmullRom)

    const innerLine = d3LineRadial<any>()
      .angle(d => angleScale.value(d.data.date))
      .radius(d => yScale.value(d[0]))
      .curve(curveCatmullRom)

    return stackedSeries.value.map(series => {
      const category = categories.value.find(c => c.nombre === series.key)
      const outerPath = outerLine(series as any)
      const innerPath = innerLine((series as any[]).slice().reverse())
      const path = outerPath && innerPath ? `${outerPath}${innerPath.replace(/^M/, 'L')}Z` : null
      return {
        key: series.key,
        color: colorHex(category?.score ?? 0),
        path
      }
    })
  })
</script>
