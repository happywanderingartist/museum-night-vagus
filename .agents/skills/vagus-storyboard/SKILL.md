---
name: vagus-storyboard
description: When designing or revising the VAGUS retrofuturist animated fine-art portfolio, create shot-by-shot storyboards, precise animation triggers, asset contracts, accessibility fallbacks, and HR-readable transitions before implementation.
---

# VAGUS Storyboard Workflow

Read the newest `VAGUS_名画奇妙夜_网站设计与动效制作方案_v5.3.md` or successor spec before changing storyboard decisions. This skill plans and reviews shots; it does not authorize installing dependencies, generating copyrighted artwork without rights checks, or modifying the website unless separately requested.

## Workflow
1. Inspect approved site order and real portfolio evidence; distinguish real screenshots from concept art. Preserve Hero: Explore / Quick Browse / Resume; section order AI articles -> Products (START then Hug) -> Xiaohongshu -> Podcast -> Literature Festival -> Visual Materials -> About Me.
2. For one scene at a time, create a 4-frame storyboard: F0 readable static entry, F1 recognizably modern art gag plus automatic speech bubble, F2 short transition triggered by normal scroll or Explore, F3 readable real portfolio evidence with real navigation.
3. Use `references/shot-template.md` exactly for each shot. Mark every effect `A` auto-once, `S` scroll/entry, `C` explicit click, or `R` static reading. Never require clicking the portrait to display the bubble. Sound is off unless visitor opts in.
4. Keep normal transition design targets around 0.3–0.7s. Use no long pinned section; fast scrolling and Quick Browse skip directly to F3. Art frame may be fullscreen / half / one-third based on the section. First real evidence is visible quickly.
5. Choose production technique per shot: CSS/SVG/GSAP for real-time website motion; Remotion only for optional fixed, short video or animatic; 3D/R3F only after 2.5D is deemed insufficient.
6. List necessary art assets, provenance/license, layer anchor, export format, mobile treatment, fallback, and visual QA risks (face drift, distorted eyewear, unreadable UI, texture mismatch).
7. Return a shot list, asset manifest, 4-frame descriptions, duration/trigger table and five pass/fail tests. Do not silently invent user achievements or product screenshots.

## Verification
- Page is usable as static HTML and works under reduced motion.
- Quote bubble appears on scene entry once without clicking, never blocks project text.
- User can skip motion and see authentic work; no blank intermediate pause.
- Mona Lisa identity/face stays recognizable; mouth/eyes/glasses remain anchored.
- Audio has user opt-in and immediately functioning pause/mute.
