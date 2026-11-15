# Vagus v5 Scroll Spike Implementation Plan

> **For agentic workers:** This is the user-authorized throwaway visual spike, implemented inline. Preserve the original site. No dependency installation, full-site integration, publish or merge is part of this run.

**Goal:** Deliver a locally runnable, reversible scroll preview of the approved-for-trial v5 direction.

**Architecture:** A new `spatial-preview-v5-2026-11-02/` directory uses the original HTML sections, styles and artwork read-only. One scroll state drives an aperture mask, a Three.js corridor, AI reveal and HTML visibility. Original motion controllers are excluded.

**Tech Stack:** Existing Three.js r186, native DOM/CSS/SVG, Node built-in HTTP server and node:test. No React or scroll hijacking.

**Spec:** `docs/superpowers/specs/2026-11-01-vagus-continuous-gallery-v5.md` and `2026-11-02-vagus-v5-implementation-handoff.md`.

## Global Constraints

- Original `site-v4` is read-only; retain artwork pixels, supported angles, contact relationships, original copy/layout and link targets.
- The new corridor is an explicitly labelled spatial study, not completed painting or accepted visual quality.
- Progress is native scroll / 1.2 viewport heights; opening .06–.38, forward camera .26–.88, stable reading thereafter.
- One property owner; no old controllers. Skip, reverse, static fallback and reduced motion must work.
- Local execution is necessary for original local files and connected Chrome review; no usable cloud preview runtime is connected.

## Open-source preflight

GitHub connector search found 14islands/r3f-scroll-rig. Public repository view showed 989 stars, 635 commits, MIT license, examples and DOM/WebGL synchronization. Useful: one shared canvas and separate semantic DOM; limitation: React/R3F and smoothing dependency do not fit this native page. The inspected package has build/dev scripts but no test script, and declares ISC while the repository view says MIT; no code is copied. Public GitHub metadata/commit API returned HTTP 403, so recent commit date remains unconfirmed. Do not use popularity as a quality verdict.

The existing local Three.js r186 has the bundled license; upstream mrdoob/three.js documents camera/geometry/rendering and has examples/test directories. Use existing camera and geometry APIs, not a downloaded starter. Sources: https://github.com/14islands/r3f-scroll-rig and https://github.com/mrdoob/three.js .

## Review Focus

- No-jump end states and original source layout.
- Forward progress, stop/reverse and no full-screen blank.
- Original artwork unchanged and no invented transparent layers.
- Keyboard/links, hash direct arrival, reduced motion and render failure.
- WebGL/context failure must not strand content in an empty sticky stage.

## Files and tasks

### Task 1: Progress contract

- Create `spatial-preview-v5-2026-11-02/motion.mjs` and `tests/motion.test.mjs`.
- Interface `sample(progress)` returns clamped progress, aperture, camera depth, arrival mask and text opacities; no time dependency.
- Check finite/clamped inputs, monotonic camera, stationary endpoints, deterministic reverse, and complete final controls using node:test.

### Task 2: Reviewable preview

- Create `assemble.cjs`, generated `index.html`, `preview.css`, `preview.mjs`, `world.mjs`, `server.cjs` and `start.cmd`.
- Reuse original home/AI HTML and styles through local allowlisted server routes; do not include old controllers.
- Use one Three canvas for new corridor geometry, lighting and occlusion cues. Preserve original art as whole compositing layers.
- Provide native scroll, direct AI/read links, original-page comparison and compact study controls. Static mode removes the extra sticky travel.
- Test local HTTP routing, HEAD/methods/traversal protection and assets; syntax-check scripts.

### Task 3: Chrome review and handoff

- Start a loopback-only server on port 4195; review in connected Google Chrome.
- Check start, opening, middle, arrival and reading; stop/reverse and direct links; compare endpoints to original HTML. Record screenshots and actual limits.
- Run checks, confirm original source diff is empty, record final local URL, filenames and test result. No full-site merge or publish.

## Execution record

- User's “尝试制作” authorizes this isolated visual spike. No additional plan approval loop is needed.
- Unlike a production feature, this trial stays in a separate directory in the existing workspace, avoiding migration or a duplicated project checkout. It remains removable as a unit and is not wired into the original site.
- Task 1 complete: progress contract, deterministic stop/reverse and clamped endpoint checks.
- Task 2 complete: independent preview, existing original sections/styles/art, Three.js corridor, static fallback and loopback-only server.
- Task 3 complete: Chrome review, five actual screenshots, 13 passing checks, independent review fixes and original-site diff check. See `spatial-preview-v5-2026-11-02/VALIDATION.md`.
- Ruling: compact viewports use complete static flow because the original controls must remain accessible; visible forward study is for desktop dimensions. No project migration or global settings were changed.
- User follow-up fix: initial 640px minimum height disabled motion in their actual 416px-high preview. Original short-height CSS already keeps AI controls within about 368px, so changed the threshold to 400px and verified WebGL plus actual wheel progress in the unchanged 944×416 viewport. Width threshold remains 760px.
- A functional preview is not a claim of formal painting, performance or user acceptance.
