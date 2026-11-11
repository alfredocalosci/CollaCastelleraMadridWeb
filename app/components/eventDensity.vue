<template>
  <div ref="containerRef" class="w-full">
    <svg
      v-if="width > 0 && height > 0"
      :width="width"
      :height="height"
      :viewBox="`0 0 ${width} ${height}`"
      preserveAspectRatio="none"
    >

      <!-- thin vertical line at the start of every month -->
      <line
        v-for="k in monthCount"
        :key="`m-${k}`"
        :x1="xScale(k - 1)"
        :x2="xScale(k - 1)"
        :y1="topBuffer"
        :y2="height"
        stroke="#e5e7eb"
        stroke-width="0.5"
      />

      <!-- all events per month, gray -->
      <rect
        v-for="b in bars"
        :key="`all-${b.index}`"
        :x="b.x"
        :y="yScale(b.total)"
        :width="b.width"
        :height="yScale(0) - yScale(b.total)"
        fill="#d1d5db"
      />

      <!-- filtered events per month, green -->
      <rect
        v-for="b in bars"
        :key="`filtered-${b.index}`"
        :x="b.x"
        :y="yScale(b.filtered)"
        :width="b.width"
        :height="yScale(0) - yScale(b.filtered)"
        fill="#059669"
      />

      <!-- thicker vertical line at the start of every year, including the closing edge -->
      <line
        v-for="i in yearCount + 1"
        :key="`y-${i}`"
        :x1="xScale((i - 1) * 12)"
        :x2="xScale((i - 1) * 12)"
        y1="0"
        :y2="height"
        stroke="#9ca3af"
        stroke-width="1"
      />

      <!-- year label to the right of each year line (not the closing edge) -->
      <text
        v-for="i in yearCount"
        :key="`yl-${i}`"
        :x="xScale((i - 1) * 12) + 4"
        y="12"
        class="font-display text-xs"
        :fill="yearInRange(i - 1) ? '#6b7280' : '#d1d5db'"
      >{{ firstYear + i - 1 }}</text>

    </svg>
  </div>
</template>

<script lang="ts" setup>
  import { scaleLinear } from 'd3'

  const props = defineProps<{
    // every actuación (past and future), unfiltered
    actuaciones: Actuacion[]
    // ids of the actuaciones matching the page filters
    filteredIds: Set<string>
    // first January shown and number of full years, same month axis as the range slider
    firstYear: number
    yearCount: number
    // selected month range [from, to) as month indices from January of firstYear, same as the slider values
    range: [number, number]
  }>()

  // a year counts as included when any of its months falls inside the selected range
  function yearInRange(yearIndex: number): boolean {
    return props.range[0] < (yearIndex + 1) * 12 && props.range[1] > yearIndex * 12
  }

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

  // space above the y axis top, reserved for the year labels
  const topBuffer = 16

  const monthCount = computed(() => props.yearCount * 12)

  // month index counted from January of firstYear, same as the slider values
  function monthIndex(fecha: string): number {
    const d = parseDate(fecha)
    return (d.getUTCFullYear() - props.firstYear) * 12 + d.getUTCMonth()
  }

  const counts = computed(() => {
    const total = new Array<number>(monthCount.value).fill(0)
    const filtered = new Array<number>(monthCount.value).fill(0)
    for (const a of props.actuaciones) {
      const k = monthIndex(a.fecha)
      if (!(k >= 0 && k < monthCount.value)) continue
      total[k]!++
      if (props.filteredIds.has(a.id)) filtered[k]!++
    }
    return { total, filtered }
  })

  // y max: highest monthly total in the dataset + 1, fixed regardless of the filters
  const maxValue = computed(() => Math.max(0, ...counts.value.total) + 1)

  // one equal-width slot per month
  const xScale = computed(() => scaleLinear().domain([0, monthCount.value]).range([0, width.value]))
  const yScale = computed(() => scaleLinear().domain([0, maxValue.value]).range([height.value, topBuffer]))

  const bars = computed(() => {
    const w = monthCount.value ? width.value / monthCount.value : 0
    return counts.value.total.map((total, index) => ({
      index,
      x: xScale.value(index),
      width: w,
      total,
      filtered: counts.value.filtered[index] ?? 0
    }))
  })
</script>
