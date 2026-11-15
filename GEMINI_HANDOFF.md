# Vagus website — Gemini handoff

Updated 2026-11-15. Repository: [happywanderingartist/museum-night-vagus](https://github.com/happywanderingartist/museum-night-vagus), branch `main`. This handoff prepares the source repository for Gemini; making the repository public does not deploy the website.

## Current source of truth

The active website source is `vagus-editions-2026/site-v4/`. The project-level `vagus-editions-2026/SITE-CURRENT.md` is dated 2026-10-27 and describes `site-v3`; do not use it as the current status. Review the code and the dated design and validation notes below before changing anything.

- `vagus-editions-2026/site-v4/` is the existing portfolio site. The current sync includes local updates to its START and HUG pages, the works directory, the local server allowlist, and a reviewable case-story package under `vagus-editions-2026/site-v4/public/product-cases-2026-11-11/`. The new case-story layout and replacement timing are still awaiting the user's visual review.
- `vagus-editions-2026/spatial-preview-v5-2026-11-02/` is a separate, reversible spatial experiment. Its November 9 revision moves the full home image upward, brings the AI image in behind it, and uses a shallow geometric threshold before stable reading. It is not integrated into `site-v4`, and its appearance has not received user acceptance.
- `vagus-editions-2026/spatial-preview-2026-10-31/` preserves an earlier experiment. Keep it as history; do not treat it as the active site.
- `vagus-editions-2026/docs/superpowers/specs/2026-11-09-mona-eye-entry-design.md` is a five-frame composition proposal for a Mona Lisa eye entry. It is a static storyboard, not a built continuous camera transition.
- `vagus-editions-2026/docs/superpowers/specs/2026-11-11-start-hug-case-design.md` records the START/HUG case-story proposal and its evidence boundaries.

## Decisions and evidence boundaries

The user prefers a continuous inward gallery and a vertical reading direction, and has rejected horizontal page transitions. This is an approved direction, not acceptance of a particular final visual. The V5 experiments and the November 9 short threshold are separate proposals; do not integrate either into the main site until the user has reviewed its visual result. For the feedback-to-plan map, branch status, and reference websites, read [GEMINI_FEEDBACK_AND_REFERENCES.md](GEMINI_FEEDBACK_AND_REFERENCES.md).

The START/HUG case package is review material, not a final public portfolio narrative. As recorded on November 11, the START batch had nine leads, two map candidates, and zero recently publishable places. The HUG browser demonstration verified refresh recovery for an ordinary synthetic item; eight recovery cards were still marked `draft_unreviewed`. Professional review, production storage, real-user outcomes, and psychological effects remain unverified. Keep these limits visible and do not turn design proposals into claims of completed product capability.

Historical validation in the V5 folder records 14 automated checks and a Google Chrome observation at 944×416 on November 9. That was a local geometric-preview check; it did not establish final art, continuous visual quality, low-end-device performance, full accessibility, user acceptance, site integration, or deployment. No project test suites were rerun as part of this documentation and GitHub sync.

## Gemini tool notes

For the verified skill and repeatable-workflow map, also read [GEMINI_SKILL_MAP.md](GEMINI_SKILL_MAP.md). It distinguishes actual use from unverified Codex Skill candidates.

For portfolio copy facts, read [GEMINI_COPY_SOURCEBOOK.md](GEMINI_COPY_SOURCEBOOK.md) and [GEMINI_SOURCE_MATERIALS.md](GEMINI_SOURCE_MATERIALS.md). The source pack contains redacted Markdown copies of the V11 master experience bank, four role-specific résumé versions, reading guide, complete START/HUG product and competitor drafts, and scrubbed QA JSON reports. The raw DOCX/PDF exports and rendered review images are still local. Treat QA as historical and keep all evidence limits.

Google's current workspace-rule docs say both Gemini CLI and Antigravity CLI read project `GEMINI.md` and `AGENTS.md` files. This handoff is also written as plain Markdown so it can be attached or pasted into Gemini web. Check the current Google product and account requirements before installing a CLI; the Gemini CLI repository currently directs some individual Google AI plans to Antigravity CLI.

For the migration approach, I reviewed Google's official `google-gemini/gemini-cli` repository (Apache-2.0, 108,834 stars, latest commit checked November 13, 2026) and its context-file guidance. The useful pattern is a small root `GEMINI.md` linked to a separate handoff. Its TypeScript/React/Ink workspace and npm tests do not apply to this site's HTML/CSS/JavaScript and Three.js setup; no code or test commands were copied. Earlier V5 research also reviewed `14islands/r3f-scroll-rig`: its shared canvas and synchronized DOM/WebGL ideas were useful, but the React/R3F/Lenis stack did not fit this native-page site. Do not add that dependency without a new review.

## Local-only material and licensing

The repository is public, so all existing branches are public too; in particular, the historical START/HUG review branch includes copied prototype files under a reference-rebuild archive path. The main-branch .gitignore does not remove material already committed on another branch. Check branch history and the linked feedback/reference register before promoting or reusing those files. The raw V11 résumé bundle remains in the local résumé workspace. Its redacted Markdown texts and four sanitized QA JSON reports are available in `GEMINI_SOURCE_MATERIALS.md`; the DOCX/PDF exports, rendered review images, scripts, and original contact fields remain local. Do not claim to have read those raw exports or infer missing facts. The repository has no root license; public visibility alone does not grant reuse rights.

## First prompt for Gemini

Use Simplified Chinese for all conversation with the user. Read `GEMINI.md`, this handoff, `GEMINI_FEEDBACK_AND_REFERENCES.md`, `GEMINI_SKILL_MAP.md`, `GEMINI_COPY_SOURCEBOOK.md`, and `GEMINI_SOURCE_MATERIALS.md`, then inspect the current `main` tree and compare the listed review branches. Report (1) the active website baseline, (2) recurring feedback and the existing solution/status for each, (3) what remains unapproved, (4) which résumé/product facts are available in the sourcebook and redacted source pack, and (5) the smallest useful next step. If the next step involves new page copy or design, present a Chinese plan first and wait for the user's direction before editing files. Preserve work and evidence boundaries; do not merge an isolated preview or review branch by assumption.
