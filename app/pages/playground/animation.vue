<template>
  <div class="w-full">
    <!-- Tall track: the sticky section stays in view while the track scrolls past (pure CSS pinning) -->
    <div
      ref="trackEl"
      :style="{ height: `calc(100vh + ${SCROLL_PER_STEP * steps.length}px)` }"
    >
      <section
        ref="sectionEl"
        class="sticky top-0 h-screen flex items-center justify-center bg-black"
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

// Source of truth: docs/animationFrames/f0..f4.svg (viewBox 1280 x 720)
const MAX_CIRCLES = 5
const E: EaseName = 'ease-in-out'
const c = (cx: number, cy: number, r: number, fill: string, ease: EaseName = E): CircleShape => ({
  cx, cy, r, fill, ease,
})

// Frames with fewer than MAX_CIRCLES get "extra" circles at the back (start of the list),
// cloned from the backmost real circle, so they are invisible but keep a start/end point for every step
const frame = (bg: string, ...shapes: CircleShape[]): AnimationStep => {
  const extras = Array.from({ length: MAX_CIRCLES - shapes.length }, () => ({ ...shapes[0]! }))
  return { bg, circles: [...extras, ...shapes] }
}

// Animation table: steps[step].circles[circle] (circle index = z-order, back to front)
const steps: AnimationStep[] = [
  // f0
  frame('#000000',
    c(320, 486, 180, '#000000'),
    c(319.239, 486, 141.225, '#DF1A22'),
  ),
  // f1
  frame('#E01A22',
    c(960, 360, 1194.5, '#E01A22'),
    c(960, 360, 636, '#F4A4A7'),
    c(960, 360, 565.5, '#EF767B'),
    c(960, 360, 495, '#EA484F'), // 565.5 - 70.5
    c(960, 360, 424.5, '#E01A22'), // 495 - 70.5
  ),
  // f2
  frame('#BBB4AF',
    c(704.366, 410.468, 54.2667, '#F9D80F'),
    c(925.467, 642.933, 310.933, '#137534'),
    c(671, 824.801, 418, '#11A242'),
    c(1108.8, 832.134, 310.2, '#17D758'),
  ),
  // f3
  frame('#F9D80F',
    c(960, 500, 320, '#FFFFFF'),
    c(960, 500, 253, '#F9D80F'),
  ),
  // f4
  frame('#118BA1',
    c(1004.5, 441.5, 209.5, '#FFFFFF'),
    c(1004.5, 441.5, 53.5, '#118BA1'),
  ),
]

const trackEl = ref<HTMLElement | null>(null)
const sectionEl = ref<HTMLElement | null>(null)
const circleEls = ref<SVGCircleElement[]>([])
const activeStep = ref(0)

let ctx: gsap.Context | undefined
let trigger: ScrollTrigger | undefined
let tl: gsap.core.Timeline | undefined
let jump: gsap.core.Timeline | undefined // running button jump, if any

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
      // Explicit from/to values (never read from live state), so the segment is correct
      // even when the timeline is seeked after a button jump
      step.circles.forEach((shape, ci) => {
        const prev = steps[i - 1]!.circles[ci]!
        tl!.fromTo(
          circleEls.value[ci]!,
          { attr: { cx: prev.cx, cy: prev.cy, r: prev.r, fill: prev.fill } },
          {
            attr: { cx: shape.cx, cy: shape.cy, r: shape.r, fill: shape.fill },
            ease: EASES[shape.ease],
            immediateRender: false,
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
        if (jump) return // a button jump is running: scroll is only being repositioned
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

// Dots: direct keyframe-to-keyframe transition, skipping intermediate steps.
// 1. scroll is repositioned instantly (the scroll handler ignores it while the jump runs)
// 2. a one-off tween goes from the live state straight to the target step
// 3. when done, the (paused) scroll timeline is seeked to the target so scrolling continues seamlessly
function goToStep(index: number) {
  if (!tl || !trigger || index === activeStep.value) return

  gsap.killTweensOf(tl) // stop any running scroll-driven tween
  jump?.kill() // a click during a jump restarts from the live state

  const target = steps[index]!
  const fromBg = sectionEl.value?.style.backgroundColor || steps[activeStep.value]!.bg
  activeStep.value = index

  window.scrollTo({ top: trigger.start + index * SCROLL_PER_STEP + 1, behavior: 'instant' })

  const progress = { p: 0 }
  jump = gsap.timeline({
    defaults: { duration: DURATION },
    onComplete: () => {
      tl!.seek(`step${index}`) // events suppressed: state already matches
      jump = undefined
    },
  })
  jump.to(progress, {
    p: 1,
    ease: 'sine.inOut',
    onUpdate: () => {
      if (sectionEl.value) {
        sectionEl.value.style.backgroundColor
          = `color-mix(in oklch, ${fromBg}, ${target.bg} ${(progress.p * 100).toFixed(2)}%)`
      }
    },
  }, 0)
  target.circles.forEach((shape, ci) => {
    jump!.to(circleEls.value[ci]!, {
      attr: { cx: shape.cx, cy: shape.cy, r: shape.r, fill: shape.fill },
      ease: EASES[shape.ease],
    }, 0)
  })
}
</script>

<style>

</style>
