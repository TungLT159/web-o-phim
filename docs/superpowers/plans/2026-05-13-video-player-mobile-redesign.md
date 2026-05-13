# Video Player Mobile Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve mobile fullscreen, redesign mobile controls, and make center play clicks reliable.

**Architecture:** Keep changes within `CustomVideoPlayer`. Add fullscreen fallback logic, isolate center play clicks from surface click handling, and use CSS media queries for the mobile-specific control layout.

**Tech Stack:** React 18, Sass, React Testing Library, CRA.

---

## File Structure

- Modify `src/components/video-player/CustomVideoPlayer.jsx`: fullscreen fallback, center play event isolation, semantic class hooks for mobile layout.
- Modify `src/components/video-player/custom-video-player.scss`: mobile bottom-sheet redesign, center button z-index/pointer improvements, feedback placement.
- Modify `src/components/video-player/CustomVideoPlayer.test.jsx`: fullscreen fallback and center play after touch tests.

### Task 1: Add Regression Tests

- [ ] **Step 1: Add fullscreen fallback and center play tests**

Add tests verifying `video.webkitEnterFullscreen()` is called when available and that center play still calls `video.play()` after a prior touch surface event.

- [ ] **Step 2: Verify RED**

Run: `npm test -- --runTestsByPath src/components/video-player/CustomVideoPlayer.test.jsx --watchAll=false`

Expected: fullscreen fallback test fails before implementation.

### Task 2: Fix Behavior

- [ ] **Step 1: Implement fullscreen fallback**

Use `video.webkitEnterFullscreen?.()` first, then `player.requestFullscreen?.()`, then `video.requestFullscreen?.()`.

- [ ] **Step 2: Isolate center play click**

Make center play handler stop propagation, clear synthetic click guard, and call `togglePlay()`.

- [ ] **Step 3: Verify GREEN**

Run: `npm test -- --runTestsByPath src/components/video-player/CustomVideoPlayer.test.jsx --watchAll=false`

Expected: all player tests pass.

### Task 3: Redesign Mobile Styles

- [ ] **Step 1: Add mobile bottom-sheet styling**

Hide meta/volume on mobile, make controls a four-column grid, enlarge buttons, and improve the progress row.

- [ ] **Step 2: Improve overlay click layers**

Raise center play z-index and ensure the full-surface hit area stays below controls and center play.

- [ ] **Step 3: Verify full app**

Run: `npm test -- --watchAll=false` and `npm run build`.

Expected: tests pass and build compiles successfully.

## Self-Review

- Spec coverage: fullscreen, center play, mobile layout, feedback, and verification are covered.
- Placeholder scan: no placeholders remain.
- Type consistency: handler and file names match current component.
