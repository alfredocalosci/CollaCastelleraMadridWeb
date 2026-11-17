import type gsap from 'gsap'

// Named text animations, referenced by `text.anim` in the animation table.
// `target` picks which SplitText parts get animated.
//   enter.from  initial (hidden) state, applied once up front to every block but the first
//   enter.to    shown state (also the natural state of the first block)
//   leave       state the text exits to

export type TextAnimName = 'lines-up' | 'words-fade'

export interface TextPreset {
  target: 'lines' | 'words'
  enter: { from: gsap.TweenVars, to: gsap.TweenVars }
  leave: gsap.TweenVars
}

export const TEXT_PRESETS: Record<TextAnimName, TextPreset> = {
  'lines-up': {
    target: 'lines',
    enter: { from: { yPercent: 110 }, to: { yPercent: 0, ease: 'power3.out' } },
    leave: { yPercent: -110, ease: 'power3.in' },
  },
  'words-fade': {
    target: 'words',
    enter: { from: { opacity: 0, y: 12 }, to: { opacity: 1, y: 0, ease: 'power2.out' } },
    leave: { opacity: 0, y: -12, ease: 'power2.in' },
  },
}
