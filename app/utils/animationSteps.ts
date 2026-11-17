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
// Paths: keyed by id, sparse per step. A key missing from a step inherits the previous step's value.
// Every path lives in the SVG from the start (hidden = opacity 0), always painted above the circles.
//   - small shapes: change `d` between steps -> MorphSVG
//   - big shapes: fade one path out while another fades in -> crossfade (opacity only)
// ---------------------------------------------------------------------------

export interface PathDef {
  d: string // initial geometry
  fill: string // initial fill
}

export interface PathState {
  x?: number
  y?: number
  scale?: number
  rotation?: number
  opacity?: number
  fill?: string
  d?: string // only when morphing
}

export type ResolvedPathState = Required<PathState>

// PLACEHOLDERS: swap for the real paths exported from the frame SVGs
export const PATHS: Record<string, PathDef> = {
  // small, morphs between steps
  badge: { d: 'M1100 100 L1140 140 L1100 180 L1060 140 Z', fill: '#FFFFFF' },
  // big, crossfade pair
  ribbonA: { d: 'M0 600 C240 540 480 660 720 600 S1120 540 1280 600 L1280 720 L0 720 Z', fill: '#FFFFFF' },
  ribbonB: { d: 'M0 560 C200 640 520 520 760 590 S1100 650 1280 570 L1280 720 L0 720 Z', fill: '#118BA1' },
}

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
  paths?: Record<string, PathState>
  text: StepText
}

// Frames with fewer than MAX_CIRCLES get "extra" circles at the back (start of the list),
// cloned from the backmost real circle, so they are invisible but keep a start/end point for every step
const frame = (
  bg: string,
  text: StepText,
  paths: Record<string, PathState> | undefined,
  ...shapes: CircleShape[]
): AnimationStep => {
  const extras = Array.from({ length: MAX_CIRCLES - shapes.length }, () => ({ ...shapes[0]! }))
  return { bg, circles: [...extras, ...shapes], paths, text }
}

// Animation table: ANIMATION_STEPS[step]
export const ANIMATION_STEPS: AnimationStep[] = [
  // f0
  frame('#000000',
    { line1: 'Animation Playground', line2: 'Second line of text', anim: 'lines-up' },
    undefined,
    c(320, 486, 180, '#000000'),
    c(319.239, 486, 141.225, '#DF1A22'),
  ),
  // f1
  frame('#E01A22',
    { line1: 'Placeholder step one', line2: 'Red circles growing', anim: 'words-fade' },
    { badge: { opacity: 1 } },
    c(960, 360, 1194.5, '#E01A22'),
    c(960, 360, 636, '#F4A4A7'),
    c(960, 360, 565.5, '#EF767B'),
    c(960, 360, 495, '#EA484F'), // 565.5 - 70.5
    c(960, 360, 424.5, '#E01A22'), // 495 - 70.5
  ),
  // f2
  frame('#BBB4AF',
    { line1: 'Placeholder step two', line2: 'Green hills rising', anim: 'lines-up' },
    {
      badge: { d: 'M1070 110 L1130 110 L1130 170 L1070 170 Z', fill: '#F9D80F' },
      ribbonA: { opacity: 1 },
    },
    c(704.366, 410.468, 54.2667, '#F9D80F'),
    c(925.467, 642.933, 310.933, '#137534'),
    c(671, 824.801, 418, '#11A242'),
    c(1108.8, 832.134, 310.2, '#17D758'),
  ),
  // f3
  frame('#F9D80F',
    { line1: 'Placeholder step three', line2: 'Yellow sun', anim: 'words-fade' },
    {
      badge: { d: 'M1100 90 L1150 150 L1100 210 L1050 150 Z', fill: '#E01A22', rotation: 20 },
      ribbonA: { opacity: 0 }, // crossfade A -> B
      ribbonB: { opacity: 1 },
    },
    c(960, 500, 320, '#FFFFFF'),
    c(960, 500, 253, '#F9D80F'),
  ),
  // f4
  frame('#118BA1',
    { line1: 'Placeholder step four', line2: 'Teal finish', anim: 'lines-up' },
    {
      badge: { opacity: 0 },
      ribbonB: { fill: '#F9D80F' },
    },
    c(1004.5, 441.5, 209.5, '#FFFFFF'),
    c(1004.5, 441.5, 53.5, '#118BA1'),
  ),
]

// Fills the sparse per-step path states: every step gets the full state of every path
// (inherited from the previous step), so timeline tweens always have explicit from/to values
const PATH_DEFAULTS = { x: 0, y: 0, scale: 1, rotation: 0, opacity: 0 }

export function resolvePaths(steps: AnimationStep[]): Record<string, ResolvedPathState>[] {
  let prev: Record<string, ResolvedPathState> = Object.fromEntries(
    Object.entries(PATHS).map(([id, def]) => [id, { ...PATH_DEFAULTS, fill: def.fill, d: def.d }]),
  )
  return steps.map((step) => {
    const next: Record<string, ResolvedPathState> = {}
    for (const id of Object.keys(prev)) {
      next[id] = { ...prev[id]!, ...step.paths?.[id] }
    }
    prev = next
    return next
  })
}

export const RESOLVED_PATHS = resolvePaths(ANIMATION_STEPS)
