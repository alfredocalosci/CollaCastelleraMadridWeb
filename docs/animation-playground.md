# Animation playground

Scroll-driven animation at `/playground/animation`. A full-viewport stage is pinned while the user scrolls; each
scroll threshold ("step") plays a GSAP transition between two keyframes: background colour, circles, SVG paths and
text.

Source of truth for the visuals: `docs/animationFrames/f0..f4.svg` (viewBox `1280 x 720`).

## Files

| File | Role |
| --- | --- |
| `app/pages/playground/animation.vue` | Template (3 layers + dot nav) and refs. No animation logic. |
| `app/utils/animationSteps.ts` | The animation table (`ANIMATION_STEPS`), path definitions, types, tuning constants. |
| `app/utils/textPresets.ts` | Named text animations (`lines-up`, `words-fade`). |
| `app/composables/useScrollScene.ts` | Builds the GSAP timeline, ScrollTrigger, step navigation. |

Everything in `utils/` and `composables/` is auto-imported by Nuxt.

## How it works

### Pinning and scroll

- A tall **track** (`calc(100vh + SCROLL_PER_STEP * steps.length)`) contains a `sticky top-0 h-screen` section. CSS
  sticky does the pinning; no GSAP pin.
- A `ScrollTrigger` over the track only reports scroll progress. `floor(scrolled / SCROLL_PER_STEP)` gives the target
  step; when it changes, the timeline plays to that step.
- Transitions are **time based** (`DURATION` seconds per step crossed), not scrubbed: scrolling past a threshold
  triggers the animation, which then runs by itself.

### Master timeline

One paused timeline, one unit per step transition (`step i-1 -> i` lives at `[i-1, i]`), with a label `step0..stepN`.
`tl.tweenTo('stepN')` plays or reverses it, so scrolling up reverses everything.

Every tween is a `fromTo` with **explicit values taken from the table** (never read from live state) and
`immediateRender: false`. That is what keeps the timeline correct when seeked, reversed, or crossed quickly.

Per transition, `useScrollScene` adds four segments:

1. **Background**: GSAP tweens a 0..1 progress; the colour is `color-mix(in oklch, from, to p%)`, so the blend stays
   vivid in the middle. Applied on the background layer, not the section.
2. **Circles**: `attr` tween of `cx, cy, r, fill`, with the ease of the target circle.
3. **Paths**: only what changes gets a tween (see below).
4. **Text**: previous block out, next block in (see below).

### Layers

```
section.sticky
├─ bg div            absolute inset-0   will-change-transform   (animated background colour)
└─ stage (aspect-video)
   ├─ svg            will-change-transform
   │   ├─ <g> circles
   │   └─ <g> paths   (always painted above the circles)
   └─ text layer     will-change-transform   (real HTML)
```

Each layer is its own compositor layer, so repainting one (e.g. the SVG every frame) does not re-rasterise the others,
notably the text.

## The animation table

`ANIMATION_STEPS[i]` is one keyframe:

```ts
interface AnimationStep {
  bg: string                          // background colour
  circles: CircleShape[]              // ordered, index = z-order (back to front)
  paths?: Record<string, PathState>   // sparse, keyed by path id
  text: { line1: string, line2: string, anim: TextAnimName }
}
```

Frames are written with the `frame(bg, text, paths, ...circles)` helper.

### Circles

Matched **by index** between steps. A frame with fewer than `MAX_CIRCLES` (5) circles is padded at the back with clones
of its backmost circle, so they are invisible but every step has a start and end point for all 5 SVG circles.

### Paths

Matched **by id**. Two parts:

- `PATHS`: static definition of each path (`d`, `fill`). Every path is rendered in the SVG from the first render,
  hidden with `opacity: 0` (a hidden path is a state, not a missing element, so the timeline stays reversible).
- `step.paths`: **sparse** per-step overrides (`x, y, scale, rotation, opacity, fill, d`). A key not mentioned in a
  step **inherits** the previous step's value.

`resolvePaths()` expands the sparse data into the full state of every path for every step (`RESOLVED_PATHS`). Step 0
starts from the defaults (`opacity 0`, no transform) plus the definition's `d` and `fill`, so a path must set
`opacity: 1` in the step where it should appear.

Two ways to animate a path:

| Goal | How | Data |
| --- | --- | --- |
| Small, simple shape changes form | **Morph** (`MorphSVGPlugin`) | give a different `d` in a later step |
| Big shape swaps for another | **Crossfade** | two paths: one goes `opacity 1 -> 0`, the other `0 -> 1` in the same step |

Example from the placeholders: `badge` morphs diamond -> square -> kite; `ribbonA`/`ribbonB` crossfade in step 3.

> The paths in `PATHS` are placeholders. Replace their `d` values with the ones exported from the frame SVGs.

### Text

One block per step (two lines), all stacked in the same grid cell and **always in the DOM** so the content stays
crawlable and accessible. Inactive blocks are only `visibility: hidden` (toggled with `autoAlpha`), never `v-if` or
`display: none`.

- Each `<p>` is split once with `SplitText` (`type: 'lines,words'`, `mask: 'lines'`, aria handled by SplitText) after
  `document.fonts.ready`, because line breaks depend on the webfont.
- `text.anim` names a preset in `textPresets.ts`: `target` (`lines` or `words`), `enter.from` (hidden start state),
  `enter.to` (shown state) and `leave` (exit state).
- The hidden start state of every block but the first is applied once with `gsap.set` (`initText`). The text tweens
  are plain `.to()` tweens, **not** `fromTo`: enter and leave (and show and hide of a block) touch the same properties
  of the same elements, and GSAP does not restore `fromTo` start values reliably when such tweens are played backward
  (old blocks stayed visible when scrolling up). Keep this in mind for any new tween that is followed by another tween
  on the same property of the same target with a state jump in between.
- Timing inside one transition (constants `TEXT_OUT` / `TEXT_IN` in the composable):

```
time in transition:  0 ───────── 0.4   0.5 ───────── 0.95   1
                     [ previous  ]  ^  [   new text in  ]
                       text out      block swap (autoAlpha)
```

Phase length is `duration + stagger`, and the stagger is a fixed **total** (`stagger: { amount }`), not per element,
so the length does not depend on how many words or lines there are. Out must finish before the swap, and in must finish
before the next transition starts; otherwise two blocks are visible at once or tweens on the same elements collide.

## Navigation

- **Scroll**: crossing a threshold calls `playToStep(target)`; duration is `|steps crossed| * DURATION`.
- **Dots**: `goToStep(i)` repositions the scroll instantly (`behavior: 'instant'`) and plays the timeline to the target.
  Intermediate steps are crossed quickly, not skipped. While the jump runs, the scroll handler is ignored (`jumping`).

## Tuning

| Constant | File | Meaning |
| --- | --- | --- |
| `SCROLL_PER_STEP` | `animationSteps.ts` | px of scroll between two step thresholds |
| `DURATION` | `animationSteps.ts` | seconds one step-to-step transition takes |
| `EASES` / `ease` per circle | `animationSteps.ts` | ease name -> GSAP ease |
| `TEXT_OUT`, `TEXT_IN` | `useScrollScene.ts` | text phase timing, see above |
| `MAX_CIRCLES` | `animationSteps.ts` | number of SVG circles (must be >= the largest frame) |

## Recipes

**Add a step**: append a `frame(...)` to `ANIMATION_STEPS`. The track height, dots and timeline follow automatically.

**Add a circle to a frame**: raise `MAX_CIRCLES` if needed and add `c(cx, cy, r, fill)` in z-order.

**Add a path**: add it to `PATHS` (hidden by default), then in the step where it appears set `{ opacity: 1 }`; to morph,
give a new `d` in later steps; to crossfade, fade it against another path.

**Add a text animation**: add a name to `TextAnimName` and an entry in `TEXT_PRESETS`. Give it `enter.from`, `enter.to` and `leave`
(no timing; the composable owns it).

## Known limitations

- `SplitText` runs once. If a resize changes how lines wrap, the split is stale (re-splitting would need `autoSplit`
  and rebuilding the timeline).
- `mask: 'lines'` clips each line to its box; with `leading-none`, glyphs that overflow the line box can be cut.
- `MorphSVG` records the start shape when the tween first renders, so a path's `d` should only change through the
  timeline.
- Text and circle/path colours are not contrast-checked against the animated background.
