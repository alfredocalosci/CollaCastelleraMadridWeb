// Turns the generated artwork geometry (one SVG per frame) into the elements to draw and, for each of them,
// its state in every frame: { opacity, x, y, scale, fill, d }. The timeline then only has to tween
// from state[i-1] to state[i]. Tuning lives in artworkSettings.ts.
import { ARTWORK_FRAMES, ARTWORK_ORDER } from './artworkGeometry'
import type { ArtLeaf } from './artworkGeometry'
import { ART_COLOR_FIXES, ART_EACH, ART_MORPHS, ART_NUDGE, ART_REF } from './artworkSettings'

export interface ArtState {
  opacity: number // 0 = hidden in this frame
  x: number // position/size relative to the element's drawing (see ART_REF): p' = scale * p + (x, y)
  y: number
  scale: number
  fill?: string
  d?: string // path geometry (changes only for morphing parts)
}

export interface ArtTarget {
  key: string // 'colla', 'stars/star_4'
  item: string
  tag: 'g' | 'path'
  d?: string // path: drawing at the reference frame
  fillRule?: string
  leaves?: ArtLeaf[] // group: its paths at the reference frame
  states: ArtState[] // one per frame
}

export interface ArtItem {
  id: string
  mode: 'each' | 'group' | 'path'
  targets: ArtTarget[]
}

type Pt = [number, number]

// Absolute commands only (what the Figma export gives): M L H V C Z
function pathPoints(d: string): Pt[] {
  const t = d.match(/[A-Za-z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) ?? []
  const out: Pt[] = []
  let x = 0
  let y = 0
  let c = ''
  for (let i = 0; i < t.length;) {
    if (/[A-Za-z]/.test(t[i]!)) c = t[i++]!
    if (c === 'Z') continue
    const n = ({ M: 2, L: 2, C: 6, H: 1, V: 1 } as Record<string, number>)[c]
    if (!n) throw new Error(`artwork: unsupported path command "${c}" (export absolute M/L/H/V/C/Z paths)`)
    const v = t.slice(i, i + n).map(Number)
    i += n
    if (c === 'H') {
      x = v[0]!
      out.push([x, y])
    }
    else if (c === 'V') {
      y = v[0]!
      out.push([x, y])
    }
    else {
      for (let j = 0; j < n; j += 2) out.push([v[j]!, v[j + 1]!])
      x = v[n - 2]!
      y = v[n - 1]!
    }
  }
  return out
}

// Least-squares uniform scale + translation mapping points a onto points b
function fitRigid(a: Pt[], b: Pt[]) {
  if (a.length !== b.length || !a.length) return null
  const n = a.length
  const ax = a.reduce((s, p) => s + p[0], 0) / n
  const ay = a.reduce((s, p) => s + p[1], 0) / n
  const bx = b.reduce((s, p) => s + p[0], 0) / n
  const by = b.reduce((s, p) => s + p[1], 0) / n
  let num = 0
  let den = 0
  a.forEach((p, i) => {
    num += (p[0] - ax) * (b[i]![0] - bx) + (p[1] - ay) * (b[i]![1] - by)
    den += (p[0] - ax) ** 2 + (p[1] - ay) ** 2
  })
  const scale = den ? num / den : 1
  const x = bx - scale * ax
  const y = by - scale * ay
  const err = Math.max(...a.map((p, i) => Math.hypot(scale * p[0] + x - b[i]![0], scale * p[1] + y - b[i]![1])))
  return { scale, x, y, err }
}

const fixColor = (c?: string) => (c ? (ART_COLOR_FIXES[c.toUpperCase()] ?? c) : c)
const FRAMES = ARTWORK_FRAMES.length
const IDENTITY = { x: 0, y: 0, scale: 1 }

// Items that only exist as morph targets are never drawn
const MORPH_SHAPES = new Set(Object.values(ART_MORPHS).flat().map(m => m.shape))

interface Part {
  key: string
  leafIds: string[]
}

function buildItem(id: string): ArtItem | null {
  const present = ARTWORK_FRAMES.map((f, i) => (f[id] ? i : -1)).filter(i => i >= 0)
  if (!present.length) return null
  const ref = ART_REF[id] ?? present.at(-1)!
  const refNode = ARTWORK_FRAMES[ref]![id]
  if (!refNode) throw new Error(`artwork: ART_REF says ${id} is drawn from frame ${ref}, but it is not in p${ref}.svg`)

  const mode: ArtItem['mode'] = ART_EACH.includes(id) ? 'each' : refNode.group ? 'group' : 'path'
  const parts: Part[] = mode === 'each'
    ? refNode.leaves.map(l => ({ key: `${id}/${l.id}`, leafIds: [l.id] }))
    : [{ key: id, leafIds: refNode.leaves.map(l => l.id) }]

  const targets = parts.map((part): ArtTarget => {
    const leavesAt = (f: number) => {
      const node = ARTWORK_FRAMES[f]![id]
      const ls = node && part.leafIds.map(lid => node.leaves.find(l => l.id === lid))
      return node && ls!.every(Boolean) ? { node, leaves: ls as ArtLeaf[] } : null
    }
    const refLeaves = leavesAt(ref)!.leaves
    const refPoints = refLeaves.flatMap(l => pathPoints(l.d))
    const chain = [...(ART_MORPHS[part.key] ?? [])].sort((a, b) => a.frame - b.frame)

    const fillOf = (f: number) => {
      const at = leavesAt(f)!
      return fixColor(mode === 'each' || mode === 'path' ? (at.leaves[0]!.fill ?? at.node.fill) : at.node.fill)
    }

    const nudged = (s: ArtState | null, f: number): ArtState | null => {
      const n = ART_NUDGE[part.key]?.[f]
      return s && n ? { ...s, x: s.x + (n.x ?? 0), y: s.y + (n.y ?? 0) } : s
    }

    const states: (ArtState | null)[] = Array.from({ length: FRAMES }, (_, f) => nudged((() => {
      const link = chain.filter(c => c.frame <= f).at(-1)
      if (link) {
        const shape = ARTWORK_FRAMES[link.frame]![link.shape]
        if (!shape) throw new Error(`artwork: morph target "${link.shape}" is not in p${link.frame}.svg`)
        return { opacity: 1, ...IDENTITY, d: shape.leaves[0]!.d, fill: fixColor(shape.leaves[0]!.fill ?? shape.fill) }
      }
      const at = leavesAt(f)
      if (!at) return null
      let pose: { x: number, y: number, scale: number } = IDENTITY
      if (f !== ref) {
        const fit = fitRigid(refPoints, at.leaves.flatMap(l => pathPoints(l.d)))
        if (fit && fit.err < 0.5) pose = fit
        else console.warn(`artwork: ${part.key} in p${f} is not a plain move/resize of its drawing in p${ref} (error ${fit?.err.toFixed(2) ?? 'different shape'}); shown without movement`)
      }
      return { opacity: 1, x: pose.x, y: pose.y, scale: pose.scale, d: refLeaves[0]!.d, fill: fillOf(f) }
    })(), f))

    // Hidden frames keep the look of the nearest frame where the element is visible (the previous one on a tie),
    // so it fades out/in in place and any repositioning happens while it is invisible
    const resolved = states.map((s, f): ArtState => {
      if (s) return s
      let best = -1
      for (let k = 0; k < FRAMES; k++) {
        if (!states[k]) continue
        if (best < 0 || Math.abs(k - f) < Math.abs(best - f)) best = k
      }
      return { ...states[best]!, opacity: 0 }
    })

    return {
      key: part.key,
      item: id,
      tag: mode === 'group' ? 'g' : 'path',
      d: mode === 'group' ? undefined : refLeaves[0]!.d,
      fillRule: mode === 'group' ? undefined : refLeaves[0]!.fillRule,
      leaves: mode === 'group' ? refLeaves.map(l => ({ ...l, fill: fixColor(l.fill) })) : undefined,
      states: resolved,
    }
  })

  return { id, mode, targets }
}

export const ARTWORK_RENDER: ArtItem[] = ARTWORK_ORDER
  .filter(id => !MORPH_SHAPES.has(id))
  .map(buildItem)
  .filter((i): i is ArtItem => !!i)

export const ARTWORK_TARGETS: ArtTarget[] = ARTWORK_RENDER.flatMap(i => i.targets)

// SVG transform attribute for a state (identity -> undefined); lets the first paint match the GSAP pose
export function artTransform(s: ArtState): string | undefined {
  return s.x || s.y || s.scale !== 1 ? `translate(${s.x} ${s.y}) scale(${s.scale})` : undefined
}
