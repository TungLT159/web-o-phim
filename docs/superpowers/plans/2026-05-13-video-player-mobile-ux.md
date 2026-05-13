# Video Player Mobile UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `CustomVideoPlayer` touch interactions reliable and improve the mobile control layout.

**Architecture:** Keep all behavior inside the existing `CustomVideoPlayer` component. Introduce a small pointer/touch gate so surface click only toggles play on non-touch interaction, while touch surfaces handle reveal/hide and double tap seek.

**Tech Stack:** React 18, Sass, React Testing Library, CRA.

---

## File Structure

- Modify `src/components/video-player/CustomVideoPlayer.jsx`: separate touch surface gestures from desktop click, ignore synthetic clicks after touch, and allow controls to receive their own events.
- Modify `src/components/video-player/custom-video-player.scss`: improve mobile control layout, hide volume group on mobile, increase tap target sizes, and improve progress affordance.
- Modify `src/components/video-player/CustomVideoPlayer.test.jsx`: add tests for mobile tap/click semantics and controls.

### Task 1: Add Interaction Regression Tests

- [ ] **Step 1: Add tests**

Add tests proving that touch single tap does not call `video.play`, a synthetic click after touch is ignored, desktop click still plays, and the chrome play button still plays.

- [ ] **Step 2: Verify RED**

Run: `npm test -- --runTestsByPath src/components/video-player/CustomVideoPlayer.test.jsx --watchAll=false`

Expected: at least one new test fails because mobile synthetic click is not ignored yet.

### Task 2: Implement Touch/Desktop Event Separation

- [ ] **Step 1: Add touch guard ref**

Add `ignoreNextClickRef` to track synthetic clicks after touch.

- [ ] **Step 2: Update surface tap handler**

Set `ignoreNextClickRef.current = true` on touch, handle single tap reveal/hide, keep double tap seek.

- [ ] **Step 3: Update surface click handler**

If `ignoreNextClickRef.current` is true, clear it and return; otherwise toggle play for desktop clicks.

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- --runTestsByPath src/components/video-player/CustomVideoPlayer.test.jsx --watchAll=false`

Expected: all player tests pass.

### Task 3: Improve Mobile Styles

- [ ] **Step 1: Hide volume group on mobile**

Use mobile media query to hide `.custom-video-player__volume`.

- [ ] **Step 2: Make mobile controls more usable**

Use larger control buttons, compact gaps, stronger bottom background, and a larger range thumb on mobile.

- [ ] **Step 3: Verify build**

Run: `npm run build`

Expected: compiled successfully.

## Self-Review

- Spec coverage: touch click bug, desktop click behavior, chrome controls, double tap, and mobile styles are covered.
- Placeholder scan: no placeholders remain.
- Type consistency: refs and handler names match existing React component style.
