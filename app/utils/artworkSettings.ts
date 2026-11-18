// THE TUNING FILE for the artwork overlays (docs/animationFrames/p*.svg).
//
// How it works: the SVG frames say WHAT is visible and WHERE in each frame. The engine (artwork.ts +
// useScrollScene.ts) derives, for every element and every frame transition, what changes
// (opacity, position/size, fill, shape) and creates one tween per change. This file only says HOW:
// timing, easing, stagger and the special effects. Anything not listed here uses ART_DEFAULTS.
//
// Timing is relative to ONE transition: 0 = transition start, 1 = transition end. Keep
// at + dur (+ stagger) <= 1, otherwise the effect would run into the next transition (a dev warning tells you).
// Everything plays in reverse when scrolling back.

export type FxKind = 'fade' | 'move' | 'fill' | 'morph' | 'exit'

export interface FxTiming {
  at?: number // start inside the transition (0..1)
  dur?: number // duration of one element (0..1)
  ease?: string // any GSAP ease
  stagger?: number // total start spread between the elements of the same item (0 = all together)
  jitter?: number // +- fraction of random-looking (but fixed) duration variation per element, e.g. 0.2
}

export interface Fx extends FxTiming {
  /** An item ('colla'), one of its parts ('stars/star_4') or all parts of an item in 'each' mode ('stars') */
  target: string
  kind: FxKind
  // kind 'exit' only: replaces the plain fade-out of the target with "shift and/or shrink, then fade out".
  // `at`/`dur`/`ease` time the shift/shrink; the fade has its own timing below
  x?: number // shift in drawing units (SVG user units, the artboard is 1280 x 720)
  y?: number // positive = down
  scale?: number // size reached (0..1)
  axis?: 'x' | 'y' | 'both' // axis of `scale`
  origin?: string // transform-origin of `scale`: the edge that stays put, e.g. '50% 100%' = bottom edge
  fadeAt?: number // when the fade out starts
  fadeDur?: number // how long the fade out lasts
}

export const ART_DEFAULTS: Record<Exclude<FxKind, 'exit'>, Required<FxTiming>> = {
  fade: { at: 0, dur: 0.5, ease: 'sine.inOut', stagger: 0, jitter: 0 },
  move: { at: 0, dur: 1, ease: 'power2.inOut', stagger: 0, jitter: 0 },
  fill: { at: 0, dur: 1, ease: 'sine.inOut', stagger: 0, jitter: 0 }, // a morphing element recolours with its morph
  morph: { at: 0, dur: 1, ease: 'power2.inOut', stagger: 0, jitter: 0 },
}

// Per transition. Key = index of the frame the transition arrives at (1 = p0 -> p1, 2 = p1 -> p2, ...)
export const ART_TRANSITIONS: Record<number, Fx[]> = {
  // p0 -> p1
  1: [
    { target: 'colla', kind: 'fade', at: 0.05, dur: 0.45 },
    // each star moves/resizes on its own: small start delays and slightly different speeds
    { target: 'stars', kind: 'move', at: 0, dur: 0.6, stagger: 0.3, jitter: 0.2, ease: 'power3.inOut' },
    { target: 'senyera', kind: 'fade', at: 0.1, dur: 0.4 },
    // pilar keeps its size and leaves moving down while it fades. It is the first thing to move, which makes it the
    // last thing to come back (moving up) when scrolling backward
    { target: 'pilar', kind: 'exit', y: 70, at: 0, dur: 0.5, ease: 'power2.in', fadeAt: 0.1, fadeDur: 0.4 },
  ],
  // p1 -> p2: the top-right star morphs into the flash, the other stars fade out
  2: [
    { target: 'stars/star_4', kind: 'morph', at: 0.1, dur: 0.8 },
    { target: 'stars', kind: 'fade', at: 0, dur: 0.4 },
  ],
  // p2 -> p3: flash -> clock
  3: [
    { target: 'stars/star_4', kind: 'morph', at: 0.05, dur: 0.9 },
  ],
  // p3 -> p4: clock -> "1", the senyera fades in once the circles have almost settled
  4: [
    { target: 'stars/star_4', kind: 'morph', at: 0, dur: 0.9 },
    { target: 'senyera', kind: 'fade', at: 0.55, dur: 0.4 },
    // "AÑOS" (p4plus.svg, id ANOS): outlined text, fades in together with the senyera
    { target: 'ANOS', kind: 'fade', at: 0.55, dur: 0.4 },
  ],
}

// Direct jump (dot click between frames that are not neighbours): the scene goes straight from where it is to the
// target frame, without passing the frames in between. Uses ART_DEFAULTS; add entries here (same format as above,
// times relative to the whole jump) to give jumps their own look, e.g. an 'exit' for the pilar.
export const ART_JUMP: Fx[] = []

// ---------------------------------------------------------------------------
// Structure settings
// ---------------------------------------------------------------------------

// Items animated part by part instead of as one group (needed for per-element stagger/jitter or morph)
export const ART_EACH: string[] = ['stars']

// Frame whose geometry is used as the "drawing" of an item (other frames are expressed as position/size
// relative to it). Default: last frame where the item appears. Use it when a part later morphs: morphing
// works in this frame's coordinates, so it must be the frame where the morph starts.
export const ART_REF: Record<string, number> = { stars: 1 }

// A part that changes shape: from `frame` on, it morphs into the (only) path of the given item.
// Those items (flash, clock, One) are not drawn on their own, they are just the morph targets.
export const ART_MORPHS: Record<string, { frame: number, shape: string }[]> = {
  'stars/star_4': [
    { frame: 2, shape: 'flash' },
    { frame: 3, shape: 'clock' },
    { frame: 4, shape: 'One' },
  ],
}

// Colour corrections applied on top of the SVG colours (no need to re-export the artwork)
export const ART_COLOR_FIXES: Record<string, string> = {
  '#F8D847': '#F9D80F', // senyera yellow -> the yellow of the f3 background
}

// Fine position correction of a part in one frame, in drawing units (+x right, +y down), applied on top of the
// artwork. senyera in p4: its own circle (centre 1005.1, 438.3) sits ~3 px above the teal circle behind it
// (centre 1004.5, 441.5), so it is moved down/left to be concentric.
export const ART_NUDGE: Record<string, Record<number, { x?: number, y?: number }>> = {
  senyera: { 4: { x: -0.6, y: 3.2 } },
}
