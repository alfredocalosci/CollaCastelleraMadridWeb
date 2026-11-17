// Builds the artwork tweens of one step transition from the resolved states (artwork.ts) and the
// tuning (artworkSettings.ts). One tween per changed property of every element; nothing here is artwork specific.
//
// Used both for the scroll timeline (step transitions) and for direct jumps (see buildArtworkSegment).
//
// All tweens are plain `.to()` tweens on purpose: GSAP records each start value when the tween first renders and
// restores it when the timeline plays backward, which is what keeps the reverse animation correct. The
// state of frame 0 is applied once in initArtwork().
import gsap from 'gsap'
import { ARTWORK_TARGETS } from './artwork'
import type { ArtTarget } from './artwork'
import { ART_DEFAULTS, ART_JUMP, ART_TRANSITIONS } from './artworkSettings'
import type { Fx, FxKind, FxTiming } from './artworkSettings'

type TimedKind = Exclude<FxKind, 'exit'>

const matches = (fx: Fx, t: ArtTarget) => fx.target === t.key || fx.target === t.item

// Defaults, then settings for the whole item, then settings for the single part (most specific wins)
function settingsFor(fxs: Fx[], t: ArtTarget, kind: TimedKind): Required<FxTiming> {
  const merged: Required<FxTiming> = { ...ART_DEFAULTS[kind] }
  const list = fxs
    .filter(fx => fx.kind === kind && matches(fx, t))
    .sort((a, b) => Number(a.target === t.key) - Number(b.target === t.key))
  for (const fx of list) {
    for (const k of ['at', 'dur', 'ease', 'stagger', 'jitter'] as const) {
      if (fx[k] !== undefined) (merged as Record<string, unknown>)[k] = fx[k]
    }
  }
  return merged
}

const exitFor = (fxs: Fx[], t: ArtTarget) =>
  fxs.filter(fx => fx.kind === 'exit' && matches(fx, t)).at(-1)

const ALL_FX = () => [...Object.values(ART_TRANSITIONS).flat(), ...ART_JUMP]

// Fixed pseudo-random value in [-1, 1] per element, so "speed variation" is the same on every load
function jitterOf(key: string) {
  let h = 2166136261
  for (const ch of key) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return ((h >>> 0) % 2001) / 1000 - 1
}

interface Pose { x: number, y: number, scale: number }
const poses = new Map<string, Pose>()
const writePose = (el: SVGElement, p: Pose) => el.setAttribute('transform', `translate(${p.x} ${p.y}) scale(${p.scale})`)

// Applies the frame-0 state and the transform origins; checks the settings reference real elements
export function initArtwork(els: Record<string, SVGElement>) {
  poses.clear()
  for (const t of ARTWORK_TARGETS) {
    const el = els[t.key]
    if (!el) continue
    const s = t.states[0]!
    const posed = t.states.some(st => st.x || st.y || st.scale !== 1)
    if (posed) {
      // Position/size is tweened on a plain object and written to the transform attribute, which is exact
      // (pose = scale * p + (x, y) in the drawing's own coordinates) and reverses cleanly
      const pose = { x: s.x, y: s.y, scale: s.scale }
      poses.set(t.key, pose)
      writePose(el, pose)
    }
    else {
      const exit = exitFor(ALL_FX(), t)
      if (exit?.origin) gsap.set(el, { transformOrigin: exit.origin })
    }
    gsap.set(el, { opacity: s.opacity, fill: s.fill })
  }

  if (import.meta.dev) {
    for (const fx of ALL_FX()) {
      if (!ARTWORK_TARGETS.some(t => matches(fx, t))) {
        console.warn(`artwork settings: no element called "${fx.target}"`)
      }
    }
  }
}

// Adds the artwork tweens for going from frame `from` to frame `to`, starting at timeline position `at`.
//   'step'   one step transition (adjacent frames): only what differs between the two frames is tweened, with the
//            settings of ART_TRANSITIONS[to]
//   'direct' a jump: EVERY element is tweened to its state in `to` from wherever it is now (so it is also right when
//            a transition was interrupted halfway), with the settings of ART_JUMP
export function buildArtworkSegment(
  tl: gsap.core.Timeline,
  from: number,
  to: number,
  at: number,
  els: Record<string, SVGElement>,
  mode: 'step' | 'direct' = 'step',
) {
  const fxs = mode === 'step' ? (ART_TRANSITIONS[to] ?? []) : ART_JUMP

  interface Job { t: ArtTarget, kind: TimedKind | 'exit' }
  const jobs: Job[] = []
  for (const t of ARTWORK_TARGETS) {
    const a = t.states[from]!
    const b = t.states[to]!
    const direct = mode === 'direct'
    if (direct || a.opacity !== b.opacity) {
      const leaving = b.opacity < (direct ? 1 : a.opacity)
      jobs.push({ t, kind: leaving && exitFor(fxs, t) ? 'exit' : 'fade' })
    }
    if (direct ? poses.has(t.key) : a.x !== b.x || a.y !== b.y || a.scale !== b.scale) jobs.push({ t, kind: 'move' })
    if (direct ? new Set(t.states.map(s => s.d)).size > 1 : a.d !== b.d) jobs.push({ t, kind: 'morph' })
    if (direct ? b.fill !== undefined : a.fill !== b.fill) jobs.push({ t, kind: 'fill' })
  }

  // Elements of the same item doing the same thing are staggered together
  const siblings = (job: Job) => jobs.filter(j => j.kind === job.kind && j.t.item === job.t.item)

  for (const job of jobs) {
    const { t, kind } = job
    const el = els[t.key]
    if (!el) continue
    const end = t.states[to]!

    if (kind === 'exit') {
      const fx = exitFor(fxs, t)!
      const vars: gsap.TweenVars = { duration: fx.dur ?? 0.5, ease: fx.ease ?? 'power2.inOut' }
      if (fx.x !== undefined) vars.x = fx.x
      if (fx.y !== undefined) vars.y = fx.y
      if (fx.scale !== undefined) vars[fx.axis === 'x' ? 'scaleX' : fx.axis === 'both' ? 'scale' : 'scaleY'] = fx.scale
      if (Object.keys(vars).length > 2) tl.to(el, vars, at + (fx.at ?? 0))
      tl.to(el, { opacity: end.opacity, duration: fx.fadeDur ?? 0.4, ease: 'sine.inOut' }, at + (fx.fadeAt ?? 0))
      continue
    }

    // A recolour that happens together with a morph follows the morph's timing
    const timingKind: TimedKind = kind === 'fill' && jobs.some(j => j.t === t && j.kind === 'morph') ? 'morph' : kind
    const s = settingsFor(fxs, t, timingKind)
    const group = siblings(job)
    const k = group.indexOf(job)
    const start = s.at + (group.length > 1 ? (s.stagger * k) / (group.length - 1) : 0)
    const dur = Math.max(0.001, s.dur * (1 + s.jitter * jitterOf(t.key)))
    if (import.meta.dev && start + dur > 1.001) {
      console.warn(`artwork settings: ${kind} of "${t.key}" (${mode} to frame ${to}) ends at ${(start + dur).toFixed(2)} (> 1)`)
    }

    const base = { duration: dur, ease: s.ease }
    const pos = at + start
    if (kind === 'fade') tl.to(el, { opacity: end.opacity, ...base }, pos)
    else if (kind === 'move') {
      const pose = poses.get(t.key)!
      tl.to(pose, { x: end.x, y: end.y, scale: end.scale, onUpdate: () => writePose(el, pose), ...base }, pos)
    }
    else if (kind === 'fill') tl.to(el, { fill: end.fill, ...base }, pos)
    else tl.to(el, { morphSVG: { shape: end.d! }, ...base }, pos)
  }
}
