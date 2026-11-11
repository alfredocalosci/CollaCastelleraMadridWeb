<template>
  <div ref="containerRef" class="w-full h-full">
    <svg
      v-if="width > 0 && height > 0"
      :width="width"
      :height="height"
      :viewBox="`0 0 ${width} ${height}`"
      preserveAspectRatio="none"
    >

      <!-- light gray horizontal reference value, drawn first so it sits behind everything else -->
      <line
        v-if="referenceValue != null"
        x1="0"
        :x2="width"
        :y1="yScale(referenceValue)"
        :y2="yScale(referenceValue)"
        stroke="#d1d5db"
        stroke-width="1"
        stroke-dasharray="2 2"
      />

      <!-- 0 value horizontal line, sitting above the reserved bottom strip -->
      <line
        x1="0"
        :x2="width"
        :y1="yScale(0)"
        :y2="yScale(0)"
        stroke="#333"
        stroke-width="1"
      />

      <!-- y scale ticks lines 
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
      -->

      <!-- vertical lines for each event -->
      <line
        v-for="d in eventDots"
        :key="`link-${d.key}`"
        :x1="d.bandX"
        :x2="d.bandX"
        :y1="yScale(0)"
        y2="0"
        :stroke="d.hasScore && d.active ? '#999' : '#ddd'"
        stroke-width="1"
       
      />

      <!-- gray background: every actuación of the year, regardless of filters -->
      <path
        v-for="layer in backgroundLayers"
        :key="`bg-${layer.key}`"
        :d="layer.path ?? ''"
        :fill="layer.color"
        stroke="white"
        stroke-width="0.5"
        stroke-opacity="0.25"
      />

      <!-- colored foreground: only actuaciones matching the filters -->
      <path
        v-for="layer in layers"
        :key="layer.key"
        :d="layer.path ?? ''"
        :fill="layer.color"
        stroke="white"
        stroke-width="0.5"
        stroke-opacity="0.25"
      />

      <!-- thin link connecting each event's band position (above) to its true time position (below) -->
      <path
        v-for="link in links"
        :key="`link-${link.key}`"
        :d="link.path ?? ''"
        fill="none"
        stroke="#999"
        stroke-width="1"
        opacity="0.5"
      />

      <!-- time scale ticks for each month -->
      <line
        v-for="month in 12"
        :key="month"
        :x1="timeScale(new Date(props.year, month - 1, 1))"
        :x2="timeScale(new Date(props.year, month - 1, 1))"
        :y1="height - 8"
        :y2="height"
        stroke="#ccc"
        stroke-width="1"
       
      />

      <!-- small dots at each event's band position, right at the curve's zero baseline -->
        <circle
        v-for="d in eventDots"
        :key="`band-${d.key}`"
        :cx="d.bandX"
        cy="2"
        r="1.5"
        :fill="d.hasScore && d.active ? '#333' : '#ccc'"
      />

      <circle
        v-for="d in eventDots"
        :key="`band-${d.key}`"
        :cx="d.bandX"
        :cy="yScale(0)"
        r="1.5"
        :fill="d.hasScore && d.active ? '#333' : '#ccc'"
      />

      <!-- events dots, one per actuación, at their true time-scale location in the reserved bottom strip -->
      <circle
        v-for="d in eventDots"
        :key="`time-${d.key}`"
        :cx="d.timeX"
        :cy="height - 8"
        :r="d.aboveReference ? 4 : 2"
        :fill="d.hasScore && d.active ? '#333' : '#ccc'"
      />

    </svg>
  </div>
</template>

<script lang="ts" setup>
  import {
    scaleBand,
    scaleTime,
    scaleLinear,
    scaleSequential,
    interpolateRgb,
    stack as d3Stack,
    stackOrderNone,
    stackOffsetNone,
    area as d3Area,
    curveBumpX,
    linkVertical
  } from 'd3'

  const props = defineProps<{
    actuaciones: Actuacion[]
    castellsList: Castell[]
    // ids of the actuaciones matching the page filters; the colored layer shows only these
    filteredIds: Set<string>
    year: number
    // shared y-scale amplitude across all year instances, so every year plots on the same scale
    maxValue: number
    // optional score drawn as a light gray horizontal reference line
    referenceValue?: number
  }>()

  // fixed strip at the bottom of the svg reserved for the per-actuación reference dots,
  // kept out of the y-scale range so the stacked shape never overlaps them
  const RESERVED_BOTTOM = 48

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

  // sum of scores across an actuación's castells + pilars
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

  // every actuación this year (including zero-score ones), chronologically ordered — each gets its own band
  const sortedActuaciones = computed(() => {
    return props.actuaciones
      .filter(a => !isNaN(parseDate(a.fecha).getTime()))
      .slice()
      .sort((a, b) => parseDate(a.fecha).getTime() - parseDate(b.fecha).getTime())
  })

  const START_KEY = '__start__'
  const END_KEY = '__end__'

  // band keys: one per real actuación plus a synthetic zero-height band on each edge, so the
  // stacked shape tapers to zero at the start/end instead of being cut off flat
  const bandKeys = computed(() => [START_KEY, ...sortedActuaciones.value.map(a => a.id), END_KEY])

  const xScale = computed(() => {
    return scaleBand<string>()
      .domain(bandKeys.value)
      .range([0, width.value])
  })

  function bandCenter(key: string): number {
    return (xScale.value(key) ?? 0) + xScale.value.bandwidth() / 2
  }

  // domain edges for the true-time x scale: a single calendar year when props.year is set,
  // or the actual min/max dates across all actuaciones when props.year is 0 (aggregate usage)
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

  // true-time x scale, covering the whole year, used to place events at their real calendar
  // position — independent from the equal-width band scale the stacked shape is drawn on
  const timeScale = computed(() => {
    return scaleTime()
      .domain([domainStart.value, domainEnd.value])
      .range([0, width.value])
  })

  // one row per band: zero rows for the synthetic edges, actual per-category scores for real actuaciones.
  // Actuaciones rejected by `include` keep their band but get a zero row, so layers stay aligned.
  function buildStreamData(include: (a: Actuacion) => boolean) {
    const zeroRow = () => Object.fromEntries(categories.value.map(c => [c.nombre, 0])) as Record<string, number>

    const rows = sortedActuaciones.value.map(a => {
      const row = zeroRow()
      if (!include(a)) return { key: a.id, ...row }
      for (const c of a.castells_array ?? []) {
        if (!c || !(c in row)) continue
        row[c] = (row[c] ?? 0) + scoreOf(c)
      }
      for (const p of a.pilars_array ?? []) {
        if (!p || !(p in row)) continue
        row[p] = (row[p] ?? 0) + scoreOf(p)
      }
      return { key: a.id, ...row }
    })

    return [
      { key: START_KEY, ...zeroRow() },
      ...rows,
      { key: END_KEY, ...zeroRow() }
    ]
  }

  const streamData = computed(() => buildStreamData(a => props.filteredIds.has(a.id)))
  const backgroundStreamData = computed(() => buildStreamData(() => true))

  // dots for every real actuación (not the synthetic edges): bandX is where it sits in the
  // equal-width stacked layout, timeX is its true calendar position
  const eventDots = computed(() => {
    return sortedActuaciones.value.map(a => ({
      key: a.id,
      bandX: bandCenter(a.id),
      timeX: timeScale.value(parseDate(a.fecha)),
      hasScore: totalScore(a) > 0,
      // score at or above the reference value: its timeline dot is drawn twice as big
      aboveReference: props.referenceValue != null && totalScore(a) >= props.referenceValue,
      active: props.filteredIds.has(a.id)
    }))
  })

  // curved links connecting each event's band position to its true time position
  const linkGenerator = linkVertical<any, { x: number; y: number }>()
    .x(d => d.x)
    .y(d => d.y)

  const links = computed(() => {
    return eventDots.value.map(d => ({
      key: d.key,
      path: linkGenerator({
        source: { x: d.bandX, y: yScale.value(0) },
        target: { x: d.timeX, y: height.value - 8 }
      } as any)
    }))
  })

  function stackRows(rows: Record<string, any>[]) {
    if (!categories.value.length || !rows.length) return []
    const stackGen = d3Stack<Record<string, any>>()
      // reversed so the lowest score sits at the bottom of the stack and the highest at the top
      .keys(categories.value.map(c => c.nombre).reverse())
      .order(stackOrderNone)
      .offset(stackOffsetNone)
    return stackGen(rows)
  }

  // 0-baseline domain shared across all year instances: 0 always sits just above the reserved bottom strip
  const yScale = computed(() => {
    const chartHeight = Math.max(0, height.value - RESERVED_BOTTOM)
    return scaleLinear().domain([0, props.maxValue * 1.1]).range([chartHeight, 0])
  })

  function buildLayers(rows: Record<string, any>[], color: (score: number) => string) {
    if (!width.value || !height.value) return []
    const areaGen = d3Area<any>()
      .x(d => bandCenter(d.data.key))
      .y0(d => yScale.value(d[0]))
      .y1(d => yScale.value(d[1]))
      .curve(curveBumpX)

    return stackRows(rows).map(series => {
      const category = categories.value.find(c => c.nombre === series.key)
      return {
        key: series.key,
        color: color(category?.score ?? 0),
        path: areaGen(series as any)
      }
    })
  }

  // gray ramp mirroring the green one: higher score = darker
  const grayScale = computed(() => {
    const scores = props.castellsList.map(c => c.score).filter(s => s > 0)
    if (!scores.length) return null
    return scaleSequential(interpolateRgb('#9ca3af', '#e5e7eb')).domain([Math.max(...scores), Math.min(...scores)])
  })

  function grayHex(score: number): string {
    if (!grayScale.value || score <= 0) return '#f3f4f6'
    return grayScale.value(score)
  }

  const layers = computed(() => buildLayers(streamData.value, colorHex))
  const backgroundLayers = computed(() => buildLayers(backgroundStreamData.value, grayHex))
</script>
