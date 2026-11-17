<template>
  <div class="w-full">
    <!-- Tall track: the sticky section stays in view while the track scrolls past (pure CSS pinning) -->
    <div
      ref="trackEl"
      :style="{ height: `calc(100vh + ${SCROLL_PER_STEP * steps.length}px)` }"
    >
      <section class="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <!-- Layer 1: animated background colour, on its own compositor layer -->
        <div
          ref="bgEl"
          class="absolute inset-0 bg-black will-change-transform"
        />

        <div class="relative w-full max-w-240 aspect-video border border-dashed text-gray-500 border-white">
          <!-- Layer 2: SVG. Circles first, paths always above -->
          <svg
            class="absolute inset-0 w-full h-full will-change-transform"
            width="1280"
            height="720"
            viewBox="0 0 1280 720"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g>
              <circle
                v-for="(c, i) in steps[0]!.circles"
                :key="i"
                :ref="(el) => (circleEls[i] = el as SVGCircleElement)"
                :cx="c.cx"
                :cy="c.cy"
                :r="c.r"
                :fill="c.fill"
              />
            </g>
            <g>
              <path
                v-for="p in initialPaths"
                :key="p.id"
                :ref="(el) => { if (el) pathEls[p.id] = el as SVGPathElement }"
                :d="p.d"
                :fill="p.fill"
                :opacity="p.opacity"
              />
            </g>
          </svg>

          <!-- Layer 3: real HTML text, one block per step stacked in the same grid cell.
               Every block stays in the DOM (crawlable); inactive ones are only visibility:hidden -->
          <div class="absolute inset-0 px-6 pt-6 text-white font-display uppercase grid content-start will-change-transform">
            <div
              v-for="(step, i) in steps"
              :key="i"
              :ref="(el) => (textEls[i] = el as HTMLElement)"
              class="col-start-1 row-start-1"
              :class="{ invisible: i > 0 }"
            >
              <p class="leading-none">
                {{ step.text.line1 }}
              </p>
              <p class="text-3xl font-bold leading-none -mt-2">
                {{ step.text.line2 }}
              </p>
            </div>
          </div>
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
// Data lives in app/utils/animationSteps.ts and app/utils/textPresets.ts,
// the timeline and scroll logic in app/composables/useScrollScene.ts (all auto-imported)
const steps = ANIMATION_STEPS
const initialPaths = Object.entries(RESOLVED_PATHS[0]!).map(([id, state]) => ({ id, ...state }))

const trackEl = ref<HTMLElement | null>(null)
const bgEl = ref<HTMLElement | null>(null)
const circleEls = ref<SVGCircleElement[]>([])
const pathEls = ref<Record<string, SVGPathElement>>({})
const textEls = ref<HTMLElement[]>([])

const { activeStep, goToStep } = useScrollScene({
  steps,
  track: trackEl,
  bg: bgEl,
  circles: circleEls,
  paths: pathEls,
  texts: textEls,
})
</script>
