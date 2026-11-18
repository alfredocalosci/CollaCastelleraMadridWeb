// Animation table for the playground. Source of truth: docs/animationFrames/f0..f4.svg (viewBox 1280 x 720)

export type EaseName = 'ease-in-out' | 'back-in-out' | 'ease-in' | 'ease-out' | 'linear'

export const EASES: Record<EaseName, string> = {
  'ease-in-out': 'power2.inOut',
  'back-in-out': 'back.inOut',
  'ease-in': 'power2.in',
  'ease-out': 'power2.out',
  'linear': 'none',
}

// Scroll tuning
export const SCROLL_PER_STEP = 300 // px of scrolling between two step thresholds
export const DURATION = 1 // seconds a single step-to-step transition takes (time based, not tied to scroll)
export const JUMP_DURATION = 1.2 // seconds a direct jump (dot click between non-neighbouring frames) takes

// Frame-0 image (docs/animationFrames/i0.svg, artwork cuatre.png): a plain HTML <img> over the SVG, placed in
// artboard units (1280 x 720). It slides down out of the viewport before the transition to frame 1 starts.
export const STAGE_IMAGE = { src: '/img/cuatre.png', x: 820, y: 107, w: 346, h: 613, exitY: '100vh' }

// Extra timeline time (in transition units) in front of the transition INTO a step, during which only the
// image moves. The transition itself keeps its normal 0..1 timing, shifted by this lead.
export const STEP_LEAD: Record<number, number> = { 1: 0.4 }
export const IMAGE_EXIT = { dur: 0.4, ease: 'power2.in', backEase: 'power2.out' } // dur must be <= STEP_LEAD[1]

// ---------------------------------------------------------------------------
// Circles: ordered list, index = z-order (back to front), matched by index between steps
// ---------------------------------------------------------------------------

export interface CircleShape {
  cx: number
  cy: number
  r: number
  fill: string
  ease: EaseName
}

const MAX_CIRCLES = 5
const E: EaseName = 'ease-in-out'
const c = (cx: number, cy: number, r: number, fill: string, ease: EaseName = E): CircleShape => ({
  cx, cy, r, fill, ease,
})

// ---------------------------------------------------------------------------
// Text: one block per step (two lines), always in the DOM, animated with a named preset (see textPresets.ts)
// ---------------------------------------------------------------------------

export interface StepText {
  line1: string
  line2: string
  anim: TextAnimName
}

// ---------------------------------------------------------------------------

export interface AnimationStep {
  bg: string
  circles: CircleShape[]
  text: StepText
}

// Frames with fewer than MAX_CIRCLES get "extra" circles at the back (start of the list),
// cloned from the backmost real circle, so they are invisible but keep a start/end point for every step
const frame = (bg: string, text: StepText, ...shapes: CircleShape[]): AnimationStep => {
  const extras = Array.from({ length: MAX_CIRCLES - shapes.length }, () => ({ ...shapes[0]! }))
  return { bg, circles: [...extras, ...shapes], text }
}

// Animation table: ANIMATION_STEPS[step]
export const ANIMATION_STEPS: AnimationStep[] = [
  // f0
  frame('#000000',
    { line1: 'hacemos', line2: 'Castells', anim: 'lines-up' },
    c(320, 486, 180, '#000000'),
    c(319.239, 486, 141.225, '#DF1A22'),
  ),
  // f1
  frame('#E01A22',
    { line1: 'en', line2: 'Madrid', anim: 'words-fade' },
    c(960, 360, 1194.5, '#E01A22'),
    c(960, 360, 636, '#F4A4A7'),
    c(960, 360, 565.5, '#EF767B'),
    c(960, 360, 495, '#EA484F'), // 565.5 - 70.5
    c(960, 360, 424.5, '#E01A22'), // 495 - 70.5
  ),
  // f2
  frame('#BBB4AF',
    { line1: 'nuestro local está en', line2: 'Vallecas', anim: 'lines-up' },
    c(704.366, 410.468, 54.2667, '#F9D80F'),
    c(925.467, 642.933, 310.933, '#137534'),
    c(671, 824.801, 418, '#11A242'),
    c(1108.8, 832.134, 310.2, '#17D758'),
  ),
  // f3
  frame('#F9D80F',
    { line1: 'ensayamos los', line2: 'Miércoles', anim: 'words-fade' },
    c(960, 500, 320, '#FFFFFF'),
    c(960, 500, 253, '#F9D80F'),
  ),
  // f4
  frame('#118BA1',
    { line1: 'en 2027 ', line2: 'cumplimos', anim: 'lines-up' },
    c(1004.5, 441.5, 209.5, '#FFFFFF'),
    c(1004.5, 441.5, 53.5, '#118BA1'),
  ),
]
