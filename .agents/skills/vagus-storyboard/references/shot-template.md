# One-scene four-frame storyboard template

| Frame | Visible image/layout | Actions/motion | Real work visible? | Notes |
|---|---|---|---|---|
| F0 | Static first-view composition | No motion required | Title + at least one authentic item, if beyond Hero | |
| F1 | Fine-art gag and speech bubble | A: once when in view | Must not hide work | |
| F2 | Transition mid-frame | S: brief scroll or Explore; no long pin | Transition immediately reveals work | |
| F3 | Portfolio reading state | R: freeze art/background | Authentic screenshot, evidence, description | |

```yaml
shot_id: HERO-01
source_art: 'licensed source, credit/rights pending'
layout_desktop: 'full-screen hero, art 45%'
layout_mobile: 'single-column, controls visible'
modern_gag: 'AR glasses'
auto_bubble: '没见过名画上班吗？'
trigger: 'entry once; Explore or normal scroll to transition'
transition: 'portrait shift + crossfade into AI article'
transition_target_ms: 550
scroll_pin: false
click_required: ['Explore', 'Quick Browse', 'Resume', 'enable audio']
real_content_visible_in_f3: ['AI article title', 'real cover image', 'summary and original link']
media_assets: ['licensed art', 'clean static poster', 'eyelid/mouth frames', 'transparent glasses']
implementation: ['CSS/GSAP', 'Remotion optional animatic']
reduced_motion: 'straight cut to readable content'
qa: ['blink natural', 'no face drift', 'no sound autoplay', 'quick navigation works', 'mobile readable']
```

For each approved shot, also produce a static image asset sheet or a Remotion 4–8 second animatic preview *only if the user separately requests it*. Actual site transition stays programmable with GSAP, not a forced long video.
