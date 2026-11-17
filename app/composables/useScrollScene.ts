import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { SplitText } from 'gsap/SplitText'
import type { Ref } from 'vue'

interface SceneOptions {
  steps: AnimationStep[]
  track: Ref<HTMLElement | null> // tall element the sticky stage scrolls through
  bg: Ref<HTMLElement | null> // background layer (colour is animated here, not on the section)
  circles: Ref<SVGCircleElement[]>
  art: Ref<Record<string, SVGElement>> // artwork elements by target key (see artwork.ts)
  texts: Ref<HTMLElement[]> // one block per step, each with two <p> lines
}

// Text timing inside one step transition (timeline units, a transition is 1 unit long).
// Phase length = duration + stagger; out must finish before `in` starts, and `in` before the next transition
const TEXT_OUT = { start: 0, duration: 0.3, stagger: 0.1 } // ends at 0.4
const TEXT_IN = { start: 0.5, duration: 0.3, stagger: 0.15 } // ends at 0.95

/**
 * Scroll-driven scene: a paused master timeline (one unit per step transition, a label per step)
 * played to the step matching the scroll position. Pinning is done by CSS sticky.
 */
export function useScrollScene({ steps, track, bg, circles, art, texts }: SceneOptions) {
  const activeStep = ref(0)

  let ctx: gsap.Context | undefined
  let trigger: ScrollTrigger | undefined
  let tl: gsap.core.Timeline | undefined
  let jumping = false // a dot-button jump is running: scroll is only being repositioned
  let splits: SplitText[] = []
  let disposed = false

  onMounted(async () => {
    gsap.registerPlugin(ScrollTrigger, MorphSVGPlugin, SplitText)
    // Ignore the mobile URL-bar show/hide resizes, which otherwise trigger a pin refresh mid-scroll
    ScrollTrigger.config({ ignoreMobileResize: true })

    // Line breaks depend on the webfont, so split only once it is loaded
    await document.fonts?.ready
    if (disposed || !track.value) return

    ctx = gsap.context(() => {
      initArtwork(art.value)
      const textParts = splitTexts()
      initText(textParts)

      tl = gsap.timeline({ paused: true, defaults: { duration: 1 } })
      tl.addLabel('step0', 0)
      steps.forEach((_, i) => {
        if (i === 0) return
        buildBackground(tl!, i)
        buildCircles(tl!, i)
        buildArtworkSegment(tl!, i, art.value)
        buildText(tl!, i, textParts)
        tl!.addLabel(`step${i}`, i)
      })

      // The trigger only tracks scroll through the track and fires step thresholds
      trigger = ScrollTrigger.create({
        trigger: track.value,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const scrolled = self.scroll() - self.start
          const target = Math.max(0, Math.min(steps.length - 1, Math.floor(scrolled / SCROLL_PER_STEP)))
          if (jumping) return
          if (target !== activeStep.value) playToStep(target)
        },
      })
    }, track.value)
  })

  onBeforeUnmount(() => {
    disposed = true
    ctx?.revert()
    splits.forEach(s => s.revert())
  })

  // --- initial state -------------------------------------------------------

  // Split every line of every text block; returns the lines/words of each block, flattened
  function splitTexts() {
    splits = []
    return texts.value.map((block) => {
      const parts = { lines: [] as Element[], words: [] as Element[] }
      block.querySelectorAll('p').forEach((p) => {
        const split = SplitText.create(p, { type: 'lines,words', mask: 'lines' })
        splits.push(split)
        parts.lines.push(...split.lines)
        parts.words.push(...split.words)
      })
      return parts
    })
  }

  // Every block but the first starts hidden: put its text in the preset's "enter from" state
  function initText(parts: ReturnType<typeof splitTexts>) {
    steps.forEach((step, i) => {
      if (i === 0) return
      const preset = TEXT_PRESETS[step.text.anim]
      gsap.set(parts[i]![preset.target], preset.enter.from)
    })
  }

  // --- timeline segments (step i-1 -> i, starting at i-1) -------------------

  // Blend in OKLCH via CSS color-mix: GSAP tweens a 0..1 progress, the colour is derived from it,
  // so the start colour never depends on live state and the midpoints stay vivid
  function buildBackground(tl: gsap.core.Timeline, i: number) {
    const from = steps[i - 1]!.bg
    const to = steps[i]!.bg
    const progress = { p: 0 }
    tl.fromTo(progress, { p: 0 }, {
      p: 1,
      ease: 'sine.inOut',
      immediateRender: false,
      onUpdate: () => {
        if (bg.value) bg.value.style.backgroundColor = `color-mix(in oklch, ${from}, ${to} ${(progress.p * 100).toFixed(2)}%)`
      },
    }, i - 1)
  }

  // Explicit from/to values (never read from live state), so segments stay correct when the timeline is seeked
  function buildCircles(tl: gsap.core.Timeline, i: number) {
    steps[i]!.circles.forEach((shape, ci) => {
      const prev = steps[i - 1]!.circles[ci]!
      tl.fromTo(
        circles.value[ci]!,
        { attr: { cx: prev.cx, cy: prev.cy, r: prev.r, fill: prev.fill } },
        {
          attr: { cx: shape.cx, cy: shape.cy, r: shape.r, fill: shape.fill },
          ease: EASES[shape.ease],
          immediateRender: false,
        },
        i - 1,
      )
    })
  }

  // Previous block's text leaves in the first half of the transition, the new block enters in the second.
  // Blocks stay in the DOM (crawlable) and are only toggled with visibility via autoAlpha.
  function buildText(tl: gsap.core.Timeline, i: number, parts: ReturnType<typeof splitTexts>) {
    const at = i - 1
    const prevPreset = TEXT_PRESETS[steps[i - 1]!.text.anim]
    const curPreset = TEXT_PRESETS[steps[i]!.text.anim]
    const prevBlock = texts.value[i - 1]!
    const curBlock = texts.value[i]!

    // Fixed total stagger (`amount`), so each phase has the same length whatever the number of words/lines:
    // out = [0, 0.4], block swap in the gap, in = [0.5, 0.95] (never runs into the next transition)
    // Plain `.to()` tweens on purpose: several tweens touch the same properties of the same elements
    // (enter then leave, show then hide), and GSAP does not restore `fromTo` start values reliably
    // when such tweens are reversed, which left old blocks visible on the way back.
    // The hidden start state is applied once in `initText()`; GSAP records the rest when each tween first renders.
    tl.to(parts[i - 1]![prevPreset.target], {
      ...prevPreset.leave, duration: TEXT_OUT.duration, stagger: { amount: TEXT_OUT.stagger },
    }, at + TEXT_OUT.start)
    tl.to(prevBlock, { autoAlpha: 0, duration: 0.01 }, at + TEXT_OUT.start + TEXT_OUT.duration + TEXT_OUT.stagger)

    tl.to(curBlock, { autoAlpha: 1, duration: 0.01 }, at + TEXT_IN.start)
    tl.to(parts[i]![curPreset.target], {
      ...curPreset.enter.to, duration: TEXT_IN.duration, stagger: { amount: TEXT_IN.stagger },
    }, at + TEXT_IN.start)
  }

  // --- navigation ----------------------------------------------------------

  // Plays (or reverses) the timeline to the given step; duration scales with the number of steps crossed
  function playToStep(index: number, onComplete?: () => void) {
    if (!tl) return
    const distance = Math.abs(index - activeStep.value)
    activeStep.value = index
    tl.tweenTo(`step${index}`, { duration: distance * DURATION, ease: 'none', overwrite: true, onComplete })
  }

  // Dots: reposition the scroll instantly (the scroll handler ignores it while the jump runs),
  // then play the timeline to the target. Intermediate steps are crossed quickly, never skipped.
  function goToStep(index: number) {
    if (!tl || !trigger || index === activeStep.value) return
    jumping = true
    window.scrollTo({ top: trigger.start + index * SCROLL_PER_STEP + 1, behavior: 'instant' })
    playToStep(index, () => {
      jumping = false
    })
  }

  return { activeStep, goToStep }
}
