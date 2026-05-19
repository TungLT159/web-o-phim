# Carousel Button Clearance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add horizontal clearance to `MovieList` and `ContinueWatchingList` so navigation buttons do not overlap the first and last carousel items.

**Architecture:** Keep the existing navigation buttons and Swiper behavior. Add RankingSection-style wrapper padding around each carousel area: 60px desktop, 50px tablet, 15px mobile, while keeping buttons at the wrapper edges.

**Tech Stack:** SCSS, Jest style-token tests.

---

### Task 1: MovieList Clearance

**Files:**
- Modify: `src/components/movie-list/MovieList.test.jsx`
- Modify: `src/components/movie-list/movie-list.scss`

- [ ] **Step 1: Write failing CSS test**

Add an assertion that `.movie-list` reserves horizontal button lanes with `padding: 0.5rem 60px`, tablet `padding: 0.5rem 50px`, and mobile `padding: 0.5rem 15px`.

- [ ] **Step 2: Verify red**

Run: `npm test -- MovieList.test.jsx --runInBand`

Expected: FAIL because `.movie-list` still uses `padding: 0.5rem 0`.

- [ ] **Step 3: Implement minimal SCSS**

Update `.movie-list` padding and responsive overrides.

- [ ] **Step 4: Verify green**

Run: `npm test -- MovieList.test.jsx --runInBand`

Expected: PASS.

### Task 2: ContinueWatchingList Clearance

**Files:**
- Modify: `src/components/continue-watching-list/ContinueWatchingList.test.jsx`
- Modify: `src/components/continue-watching-list/continue-watching-list.scss`

- [ ] **Step 1: Write failing CSS test**

Add an assertion that `.continue-watching-list__carousel-wrapper` reserves horizontal button lanes with `padding: 0 60px`, tablet `padding: 0 50px`, and mobile `padding: 0 15px`.

- [ ] **Step 2: Verify red**

Run: `npm test -- ContinueWatchingList.test.jsx --runInBand`

Expected: FAIL because the wrapper has no horizontal padding.

- [ ] **Step 3: Implement minimal SCSS**

Update `.continue-watching-list__carousel-wrapper` padding and responsive overrides.

- [ ] **Step 4: Verify green and full suite**

Run: `npm test -- ContinueWatchingList.test.jsx MovieList.test.jsx --runInBand`, then `npm test -- --runInBand`.

Expected: PASS.
