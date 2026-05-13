# Video Player Mobile Double Tap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add mobile double tap seek gestures to `CustomVideoPlayer` and fix hover/center play UI issues.

**Architecture:** Keep behavior inside the existing `CustomVideoPlayer` component. Reuse the existing `seekBy` function, add touch/click gesture detection on the video hit area, and keep visual fixes in the component SCSS.

**Tech Stack:** React 18, CRA, Sass, React Testing Library.

---

## File Structure

- Modify `src/components/video-player/CustomVideoPlayer.jsx`: add double tap detection, seek feedback state, and mobile-aware hit-area handling.
- Modify `src/components/video-player/custom-video-player.scss`: add seek feedback overlays, constrain hover styles to hover-capable pointers, and fix center play alignment.
- Modify `src/components/video-player/CustomVideoPlayer.test.jsx`: add regression tests for double tap left/right seeking.

### Task 1: Test Double Tap Seek

- [ ] **Step 1: Add tests**

Add tests that set `getBoundingClientRect()` on the player/hit area, fire two touch/click events on left and right halves, and assert `video.currentTime` changes by -10/+10.

- [ ] **Step 2: Run tests to verify RED**

Run: `npm test -- --runTestsByPath src/components/video-player/CustomVideoPlayer.test.jsx --watchAll=false`

Expected: FAIL because double tap seeking is not implemented.

### Task 2: Implement Double Tap Seek

- [ ] **Step 1: Add refs/state**

Add refs for last tap time and side, plus feedback state `{ side, label }`.

- [ ] **Step 2: Add tap handler**

Detect a second tap within 300ms on the same half. Left half calls `seekBy(-10)`, right half calls `seekBy(10)`, then shows feedback.

- [ ] **Step 3: Render feedback overlays**

Render left/right feedback elements when feedback state is active.

- [ ] **Step 4: Run tests to verify GREEN**

Run: `npm test -- --runTestsByPath src/components/video-player/CustomVideoPlayer.test.jsx --watchAll=false`

Expected: PASS.

### Task 3: Fix UI Styling

- [ ] **Step 1: Restrict hover effects**

Move button hover transforms/background changes under `@media (hover: hover) and (pointer: fine)`.

- [ ] **Step 2: Fix center play alignment**

Use `translate: -50% -50%` for centering and `transform: scale(...)` for hover, remove icon margin offset.

- [ ] **Step 3: Add feedback styles**

Style `.custom-video-player__seek-feedback` as centered left/right translucent circles with pink accent.

- [ ] **Step 4: Verify build**

Run: `npm run build`

Expected: compiled successfully.

## Self-Review

- Spec coverage: double tap seek, feedback overlay, hover fix, center play alignment, tests, and build verification are covered.
- Placeholder scan: no placeholders remain.
- Type consistency: files and behavior names match existing component structure.
