# Animation playground

Scroll-driven animation at `/playground/animation`. A full-viewport stage is pinned while the user scrolls; each
scroll threshold ("step") plays a GSAP transition between two keyframes: background colour, circles, SVG artwork and
text.

Source of truth for the visuals: `docs/animationFrames/f0..f4.svg` (viewBox `1280 x 720`).

## Files

| File | Role |
| --- | --- |
| `app/pages/playground/animation.vue` | Template (3 layers + dot nav) and refs. No animation logic. |
| `app/utils/animationSteps.ts` | The animation table (`ANIMATION_STEPS`): background, circles, text per step; tuning constants. |
| `docs/animationFrames/p0..pN.svg` | Artwork overlays, one SVG per frame (source of truth for the artwork). |
| `scripts/build-artwork.mjs` | Generator: `npm run build:artwork` turns the `p*.svg` into `app/utils/artworkGeometry.ts`. |
| `app/utils/artworkGeometry.ts` | **Generated**, do not edit. Geometry of every artwork item in every frame. |
| `app/utils/artworkSettings.ts` | **The tuning file for the artwork**: timing, easing, stagger, effects, morphs. |
| `app/utils/artwork.ts` | Resolves geometry into drawable elements and their state (opacity/position/size/fill/shape) per frame. |
| `app/utils/artworkTimeline.ts` | Turns state changes + settings into GSAP tweens. |
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
3. **Artwork**: one tween per changed property of every artwork element (see below).
4. **Text**: previous block out, next block in (see below).

### Layers

```
section.sticky
├─ bg div            absolute inset-0   will-change-transform   (animated background colour)
└─ stage (aspect-video)
   ├─ svg            will-change-transform
   │   ├─ <g> circles
   │   └─ artwork     (always painted above the circles)
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
  text: { line1: string, line2: string, anim: TextAnimName }
}
```

Frames are written with the `frame(bg, text, ...circles)` helper.

### Circles

Matched **by index** between steps. A frame with fewer than `MAX_CIRCLES` (5) circles is padded at the back with clones
of its backmost circle, so they are invisible but every step has a start and end point for all 5 SVG circles.

### Artwork overlays

The artwork (logo parts, stars, flash, clock, "1", ...) is designed as one SVG per frame, `docs/animationFrames/pN.svg`,
on the same 1280 x 720 artboard as the circle frames. Conventions:

- The first child `<g id="pN">` is the frame. Its `<rect>` (background) is ignored.
- Every other child is a top-level **item**: a `<path>` or a `<g>` of paths, with an `id`. The same id in several
  frames is the same item. An item missing from a frame is **hidden** in it.
- Absolute `M L H V C Z` path commands, no transforms/strokes (the Figma export already is).
- Draw order is merged from all frames (a conflict makes the generator fail).

After changing an SVG run `npm run build:artwork` (rewrites `app/utils/artworkGeometry.ts`).

**State per frame.** `artwork.ts` derives, for every drawn element and every frame, `{ opacity, x, y, scale, fill, d }`:

- Present in the frame: `opacity 1`. Absent: `opacity 0`, and it keeps the look of the nearest frame where it is
  visible (the previous one on a tie), so it fades in/out in place and any repositioning happens while invisible.
- Position/size is **measured from the geometry**: the item's paths in each frame are fitted to its drawing in the
  reference frame with a uniform scale + translation (the generator's data must match within 0.5 px, otherwise a warning
  says that frame is not a plain move/resize). Fill comes from the SVG (`ART_COLOR_FIXES` can correct a colour).
- **Group or each.** A `<g>` is animated as one element by default (`senyera`, `colla`). Items listed in `ART_EACH`
  (`stars`) are animated part by part, which allows stagger/jitter and per-part morphing.
- **Reference frame** (`ART_REF`): the frame whose geometry is the "drawing" (default: last frame where the item
  appears). Morphs work in its coordinates.
- **Morph chains** (`ART_MORPHS`): from a given frame a part morphs into the single path of another item
  (`stars/star_4` -> `flash` -> `clock` -> `One`). Those items are morph targets only and are not drawn.

**Effects.** Each change becomes one tween: opacity -> `fade`, position/size -> `move`, shape -> `morph`, colour -> `fill`
(a recolour that comes with a morph follows the morph's timing). `exit` is a special exit that replaces the plain fade-out: an optional shift (`x`, `y`) and/or
shrink (`scale` from an edge), then a fade. Defaults are in `ART_DEFAULTS`; `ART_TRANSITIONS[i]` overrides them per transition (`i` = frame arrived at):

```ts
{ target: 'stars', kind: 'move', at: 0, dur: 0.6, stagger: 0.3, jitter: 0.2, ease: 'power3.inOut' }
```

| Setting | Meaning |
| --- | --- |
| `target` | an item (`senyera`), one part (`stars/star_4`) or all parts of an `each` item (`stars`) |
| `kind` | `fade`, `move`, `fill`, `morph`, `exit` |
| `at`, `dur` | start and length inside the transition, `0..1` (keep `at + dur (+ stagger) <= 1`; a dev warning tells you) |
| `ease` | any GSAP ease |
| `stagger` | total start spread across the parts of an item (0 = together) |
| `jitter` | +- fraction of duration variation per part, fixed per element so it is the same on every load |
| `x`, `y` | `exit` only: shift in drawing units (positive `y` = down), timed by `at`/`dur`/`ease` |
| `scale`, `axis`, `origin` | `exit` only: end size, its axis, and the edge that stays put (`'50% 100%'` = bottom) |
| `fadeAt`, `fadeDur` | `exit` only: when the fade starts and how long it lasts |

Everything plays in reverse when scrolling back (an `exit` comes back from where it went). Reverse order is the mirror of
forward order: what starts first going forward finishes last going back (the pilar is timed this way so it is the last
thing to return).

`ART_NUDGE` moves a part by a few drawing units in one frame, e.g. to centre the senyera in the small circle of frame 4.

Move/resize is tweened on a plain `{x, y, scale}` object that writes the SVG `transform` attribute, not with GSAP's
transform plugin: `svgOrigin` proved unreliable when combined with an existing transform.

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

**Add artwork**: draw it in the `pN.svg` frames where it is visible (same id everywhere), run
`npm run build:artwork`, then tune it in `artworkSettings.ts`. Defaults already fade it in/out and move/resize it;
add entries to `ART_TRANSITIONS` only to change how.

**Make a part morph**: add it to `ART_EACH` if it lives in a group, point `ART_REF` at the frame where the morph starts,
and list the shapes in `ART_MORPHS`.

**Add a text animation**: add a name to `TextAnimName` and an entry in `TEXT_PRESETS`. Give it `enter.from`, `enter.to` and `leave`
(no timing; the composable owns it).

## Known limitations

- `SplitText` runs once. If a resize changes how lines wrap, the split is stale (re-splitting would need `autoSplit`
  and rebuilding the timeline).
- `mask: 'lines'` clips each line to its box; with `leading-none`, glyphs that overflow the line box can be cut.
- Elements that exit with an `exit` effect are not reset: it assumes they do not reappear later.
- The generator/resolver support only absolute `M L H V C Z` paths (the resolver throws on anything else).
- Text and circle/path colours are not contrast-checked against the animated background.
