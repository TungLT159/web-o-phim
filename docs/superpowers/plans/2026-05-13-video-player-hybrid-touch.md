# Video Player Hybrid Touch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign touch-device player UI as a simple custom progress/icon overlay and improve desktop center play reliability.

**Architecture:** Keep one `CustomVideoPlayer` component. Use media queries for touch-device layout and small semantic class hooks for stable styling/tests. Keep behavior minimal: surface tap reveals controls; explicit buttons perform actions.

**Tech Stack:** React 18, Sass, React Testing Library, CRA.

---

## File Structure

- Modify `src/components/video-player/CustomVideoPlayer.jsx`: add semantic class names for control buttons and ensure center play click remains isolated.
- Modify `src/components/video-player/custom-video-player.scss`: replace mobile bottom-sheet styling with touch-device hybrid overlay using `@media (hover: none) and (pointer: coarse)`.
- Modify `src/components/video-player/CustomVideoPlayer.test.jsx`: add/adjust tests for reliable center play and existing control behavior.

### Task 1: Add Regression Coverage

- [ ] **Step 1: Add tests or assertions for stable hooks**

Ensure tests can identify the center play button and fullscreen button reliably after adding class hooks.

- [ ] **Step 2: Run focused tests**

Run: `npm test -- --runTestsByPath src/components/video-player/CustomVideoPlayer.test.jsx --watchAll=false`

Expected: tests pass after hook-only updates or fail if hooks are missing.

### Task 2: Implement Hybrid Touch UI

- [ ] **Step 1: Add semantic classes**

Add class names for center play, rewind, play, forward, fullscreen, and volume group if missing.

- [ ] **Step 2: Replace mobile CSS**

Use touch-device media query to hide metadata/volume, render a compact overlay, enlarge progress and icon buttons, and reduce visual noise.

- [ ] **Step 3: Run focused tests**

Run: `npm test -- --runTestsByPath src/components/video-player/CustomVideoPlayer.test.jsx --watchAll=false`

Expected: all player tests pass.

### Task 3: Verify App

- [ ] **Step 1: Run full test suite**

Run: `npm test -- --watchAll=false`

Expected: all tests pass.

- [ ] **Step 2: Run production build**

Run: `npm run build`

Expected: compiled successfully.

## Self-Review

- Spec coverage: hybrid touch UI, fullscreen fallback, desktop center click, and verification are covered.
- Placeholder scan: no placeholders remain.
- Type consistency: class names and component files match current code.
