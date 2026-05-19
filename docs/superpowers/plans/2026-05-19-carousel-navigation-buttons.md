# Carousel Navigation Buttons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add RankingSection-style previous and next navigation buttons to `MovieList` and `ContinueWatchingList`.

**Architecture:** Each carousel imports Swiper `Navigation`, includes it in `modules`, points `navigation.nextEl/prevEl` at component-specific button classes, and renders two chevron button divs beside the Swiper. Styles stay local to each component and mirror RankingSection's black circular edge buttons.

**Tech Stack:** React, Swiper, SCSS, Jest, React Testing Library.

---

### Task 1: MovieList Navigation Buttons

**Files:**
- Modify: `src/components/movie-list/MovieList.test.jsx`
- Modify: `src/components/movie-list/MovieList.jsx`
- Modify: `src/components/movie-list/movie-list.scss`

- [ ] **Step 1: Write failing tests**

In `MovieList.test.jsx`, update the Swiper mock to expose `modules` and `navigation`, mock `Navigation`, then assert the carousel receives navigation config and renders `.movie-list__button-prev` and `.movie-list__button-next` with chevron icons.

- [ ] **Step 2: Verify red**

Run: `npm test -- MovieList.test.jsx --runInBand`

Expected: FAIL because MovieList does not use `Navigation` or render buttons yet.

- [ ] **Step 3: Implement minimal code**

In `MovieList.jsx`, import `Navigation`, use `modules={[Navigation, Autoplay]}`, pass `navigation={{ nextEl: ".movie-list__button-next", prevEl: ".movie-list__button-prev" }}`, and render the two button divs after `Swiper`.

In `movie-list.scss`, style local buttons like RankingSection: absolute 50px black circular buttons at left/right with hidden Swiper pseudo arrow and Boxicons chevrons.

- [ ] **Step 4: Verify green**

Run: `npm test -- MovieList.test.jsx --runInBand`

Expected: PASS.

### Task 2: ContinueWatchingList Navigation Buttons

**Files:**
- Modify: `src/components/continue-watching-list/ContinueWatchingList.test.jsx`
- Modify: `src/components/continue-watching-list/ContinueWatchingList.jsx`
- Modify: `src/components/continue-watching-list/continue-watching-list.scss`

- [ ] **Step 1: Write failing tests**

In `ContinueWatchingList.test.jsx`, update the Swiper mock to expose `Navigation` in `modules` and `navigation`, then assert the carousel receives navigation config and renders `.continue-watching-list__button-prev` and `.continue-watching-list__button-next` with chevron icons.

- [ ] **Step 2: Verify red**

Run: `npm test -- ContinueWatchingList.test.jsx --runInBand`

Expected: FAIL because ContinueWatchingList does not use `Navigation` or render buttons yet.

- [ ] **Step 3: Implement minimal code**

In `ContinueWatchingList.jsx`, import `Navigation`, use `modules={[Navigation, Autoplay]}`, pass `navigation={{ nextEl: ".continue-watching-list__button-next", prevEl: ".continue-watching-list__button-prev" }}`, and render the two button divs after `Swiper`.

In `continue-watching-list.scss`, add a wrapper and local button styles matching RankingSection's black circular edge buttons.

- [ ] **Step 4: Verify green and integration**

Run: `npm test -- MovieList.test.jsx ContinueWatchingList.test.jsx Home.test.jsx --runInBand`

Expected: PASS.
