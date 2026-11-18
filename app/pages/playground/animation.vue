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

        <div class="relative w-full max-w-240 aspect-video text-gray-500 ">
          <!-- Layer 2: SVG (decorative). Circles first, artwork always above -->
          <svg
            class="absolute inset-0 w-full h-full will-change-transform"
            width="1280"
            height="720"
            viewBox="0 0 1280 720"
            aria-hidden="true"
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
            <!-- Artwork overlays (docs/animationFrames/p*.svg), drawn from frame-0 state; GSAP takes over on mount -->
            <template v-for="item in artwork" :key="item.id">
              <g v-if="item.mode === 'each'" :id="item.id">
                <path
                  v-for="t in item.targets"
                  :key="t.key"
                  :ref="(el) => setArt(t.key, el)"
                  :d="t.d"
                  :fill="t.states[0]!.fill"
                  :fill-rule="t.fillRule"
                  :opacity="t.states[0]!.opacity"
                  :transform="artTransform(t.states[0]!)"
                />
              </g>
              <g
                v-else-if="item.mode === 'group'"
                :id="item.id"
                :ref="(el) => setArt(item.id, el)"
                :fill="item.targets[0]!.states[0]!.fill"
                :opacity="item.targets[0]!.states[0]!.opacity"
                :transform="artTransform(item.targets[0]!.states[0]!)"
              >
                <path
                  v-for="leaf in item.targets[0]!.leaves"
                  :key="leaf.id"
                  :d="leaf.d"
                  :fill="leaf.fill"
                  :fill-rule="leaf.fillRule"
                />
              </g>
              <path
                v-else
                :id="item.id"
                :ref="(el) => setArt(item.id, el)"
                :d="item.targets[0]!.d"
                :fill="item.targets[0]!.states[0]!.fill"
                :fill-rule="item.targets[0]!.fillRule"
                :opacity="item.targets[0]!.states[0]!.opacity"
                :transform="artTransform(item.targets[0]!.states[0]!)"
              />
            </template>
          </svg>

          <!-- Frame-0 image (docs/animationFrames/i0.svg), placed in artboard units; slides down out of the viewport -->
          <img
            ref="imageEl"
            :src="STAGE_IMAGE.src"
            alt=""
            aria-hidden="true"
            class="absolute will-change-transform"
            :style="{
              left: `${STAGE_IMAGE.x / 12.8}%`,
              top: `${STAGE_IMAGE.y / 7.2}%`,
              width: `${STAGE_IMAGE.w / 12.8}%`,
              height: `${STAGE_IMAGE.h / 7.2}%`,
            }"
          >

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
              <p class="text-4xl font-extrabold leading-none -mt-3">
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
            class="w-6 h-6 rounded-full cursor-pointer border-4 box-border"
            :class="i === activeStep ? 'border-white' : 'border-transparent'"
            :style="{ backgroundColor: step.bg }"
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
const artwork = ARTWORK_RENDER

const trackEl = ref<HTMLElement | null>(null)
const bgEl = ref<HTMLElement | null>(null)
const circleEls = ref<SVGCircleElement[]>([])
const artEls = ref<Record<string, SVGElement>>({})
const setArt = (key: string, el: unknown) => {
  if (el) artEls.value[key] = el as SVGElement
}
const textEls = ref<HTMLElement[]>([])
const imageEl = ref<HTMLElement | null>(null)

const { activeStep, goToStep } = useScrollScene({
  steps,
  track: trackEl,
  bg: bgEl,
  circles: circleEls,
  art: artEls,
  texts: textEls,
  image: imageEl,
})
</script>
