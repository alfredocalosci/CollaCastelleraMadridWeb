<template>
  <div class="w-full">
    <!-- Tall track: the sticky section stays in view while the track scrolls past (pure CSS pinning) -->
    <div
      ref="trackEl"
      :style="{ height: `calc(100vh + ${SCROLL_PER_STEP * steps.length}px)` }"
    >
      <section
        ref="sectionEl"
        class="sticky top-0 h-screen flex items-center justify-center bg-gray-300"
      >
        <div class="relative w-full max-w-240 aspect-video border border-dashed text-gray-500 border-white">
          <svg
            class="absolute inset-0 w-full h-full"
            width="1280"
            height="720"
            viewBox="0 0 1280 720"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              v-for="(c, i) in steps[0]!.circles"
              :key="i"
              :ref="(el) => (circleEls[i] = el as SVGCircleElement)"
              :cx="c.cx"
              :cy="c.cy"
              :r="c.r"
              :fill="c.fill"
            />
          </svg>
          <p class="relative p-6">
            Animation Playground
          </p>
        </div>
        <nav class="absolute bottom-8 inset-x-0 flex justify-center gap-3">
          <button
            v-for="(step, i) in steps"
            :key="i"
            type="button"
            :aria-label="`Go to step ${i + 1}`"
            :aria-current="i === activeStep"
            class="w-6 h-6 rounded-full bg-white cursor-pointer border-2 box-border"
            :class="i === activeStep ? 'border-gray-900' : 'border-transparent'"
            @click="goToStep(i)"
          />
        </nav>
      </section>
    </div>

    <article class="p-6 min-h-screen">
      <p>article text</p>
    </article>
  </div>
</template>

<script lang="ts" setup>
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

type EaseName = 'ease-in-out' | 'back-in-out' | 'ease-in' | 'ease-out' | 'linear'

interface CircleShape {
  cx: number
  cy: number
  r: number
  fill: string
  ease: EaseName
}

interface AnimationStep {
  bg: string
  circles: CircleShape[]
}

const EASES: Record<EaseName, string> = {
  'ease-in-out': 'power2.inOut',
  'back-in-out': 'back.inOut',
  'ease-in': 'power2.in',
  'ease-out': 'power2.out',
  'linear': 'none',
}

// Scroll tuning
const SCROLL_PER_STEP = 300 // px of scrolling between two step thresholds
const DURATION = 1 // seconds a single step-to-step transition takes (time based, not tied to scroll)

// Grid: every position and radius is a multiple of 16 (viewBox 1280 x 720 = 80 x 45 cells)
const g = (n: number) => n * 16

// Shared palette for circle fills and background transitions
const palette = {
  gray: '#d1d5dc', // tailwind gray-300 (initial bg)
  white: '#ffffff',
  orange: '#f97316',
  teal: '#14b8a6',
  indigo: '#6366f1',
  pink: '#ec4899',
  yellow: '#facc15',
  slate: '#1e293b',
  sky: '#38bdf8',
  green: '#22c55e',
} as const

const E: EaseName = 'ease-in-out'
const c = (cx: number, cy: number, r: number, fill: string, ease: EaseName = E): CircleShape => ({
  cx: g(cx), cy: g(cy), r: g(r), fill, ease,
})

// Animation table: steps[step].circles[circle]
// Center of the grid: x = 40 (640px), y = 22 (352px)
const steps: AnimationStep[] = [
  {
    // Step 1: five overlapped white circles at the center
    bg: palette.gray,
    circles: [
      c(40, 22, 4, palette.white),
      c(40, 22, 4, palette.white),
      c(40, 22, 4, palette.white),
      c(40, 22, 4, palette.white),
      c(40, 22, 4, palette.white),
    ],
  },
  {
    // Step 2: horizontal row
    bg: palette.slate,
    circles: [
      c(20, 22, 4, palette.orange, 'back-in-out'),
      c(30, 22, 4, palette.yellow, 'back-in-out'),
      c(40, 22, 4, palette.green, 'back-in-out'),
      c(50, 22, 4, palette.sky, 'back-in-out'),
      c(60, 22, 4, palette.pink, 'back-in-out'),
    ],
  },
  {
    // Step 3: diagonal
    bg: palette.teal,
    circles: [
      c(20, 10, 3, palette.white),
      c(30, 16, 3, palette.yellow),
      c(40, 22, 3, palette.orange),
      c(50, 28, 3, palette.slate),
      c(60, 34, 3, palette.indigo),
    ],
  },
  {
    // Step 4: pentagon
    bg: palette.indigo,
    circles: [
      c(40, 10, 3, palette.white),
      c(52, 18, 3, palette.pink),
      c(48, 32, 3, palette.yellow),
      c(32, 32, 3, palette.sky),
      c(28, 18, 3, palette.green),
    ],
  },
  {
    // Step 5: concentric
    bg: palette.pink,
    circles: [
      c(40, 22, 12, palette.slate),
      c(40, 22, 10, palette.indigo),
      c(40, 22, 8, palette.sky),
      c(40, 22, 6, palette.yellow),
      c(40, 22, 4, palette.white),
    ],
  },
]

const trackEl = ref<HTMLElement | null>(null)
const sectionEl = ref<HTMLElement | null>(null)
const circleEls = ref<SVGCircleElement[]>([])
const activeStep = ref(0)

let ctx: gsap.Context | undefined
let trigger: ScrollTrigger | undefined
let tl: gsap.core.Timeline | undefined

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  // Ignore the mobile URL-bar show/hide resizes, which otherwise trigger a pin refresh mid-scroll
  ScrollTrigger.config({ ignoreMobileResize: true })

  ctx = gsap.context(() => {
    // Paused timeline: one segment (1 unit) per step transition, with a label per step
    tl = gsap.timeline({ paused: true, defaults: { duration: 1 } })
    tl.addLabel('step0', 0)

    steps.forEach((step, i) => {
      if (i === 0) return
      const at = i - 1
      // Blend in OKLCH via CSS color-mix: GSAP tweens a 0..1 progress, the colour is derived from it,
      // so the start colour never depends on live state and the midpoints stay vivid
      const from = steps[i - 1]!.bg
      const progress = { p: 0 }
      tl!.fromTo(
        progress,
        { p: 0 },
        {
          p: 1,
          ease: 'sine.inOut',
          immediateRender: false,
          onUpdate: () => {
            if (sectionEl.value) {
              sectionEl.value.style.backgroundColor
                = `color-mix(in oklch, ${from}, ${step.bg} ${(progress.p * 100).toFixed(2)}%)`
            }
          },
        },
        at,
      )
      step.circles.forEach((shape, ci) => {
        tl!.to(
          circleEls.value[ci]!,
          {
            attr: { cx: shape.cx, cy: shape.cy, r: shape.r, fill: shape.fill },
            ease: EASES[shape.ease],
          },
          at,
        )
      })
      tl!.addLabel(`step${i}`, i)
    })

    // Pinning is done by CSS sticky; the trigger only tracks scroll through the track and fires thresholds
    trigger = ScrollTrigger.create({
      trigger: trackEl.value,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const scrolled = self.scroll() - self.start
        const target = Math.max(0, Math.min(steps.length - 1, Math.floor(scrolled / SCROLL_PER_STEP)))
        if (target !== activeStep.value) playToStep(target)
      },
    })
  }, sectionEl.value!)
})

onBeforeUnmount(() => ctx?.revert())

// Plays (or reverses) the timeline to the given step; duration scales with the number of steps crossed
function playToStep(index: number) {
  if (!tl) return
  const distance = Math.abs(index - activeStep.value)
  activeStep.value = index
  tl.tweenTo(`step${index}`, { duration: distance * DURATION, ease: 'none', overwrite: true })
}

// Dots scroll just past the threshold of the given step
function goToStep(index: number) {
  if (!trigger) return
  const top = trigger.start + index * SCROLL_PER_STEP + 1
  window.scrollTo({ top, behavior: 'smooth' })
}
</script>

<style>

</style>
