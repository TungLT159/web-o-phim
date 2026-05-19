# Continue Watching Autoplay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire `ContinueWatchingList` to Swiper's `Autoplay` module so its existing autoplay config works like `MovieList`.

**Architecture:** Keep the current carousel structure unchanged. Import `Autoplay` from `swiper/modules` and pass `modules={[Autoplay]}` to the `Swiper` used by `ContinueWatchingList`.

**Tech Stack:** React, Swiper, Jest, React Testing Library.

---

### Task 1: Continue Watching Swiper Autoplay Module

**Files:**
- Modify: `src/components/continue-watching-list/ContinueWatchingList.test.jsx`
- Modify: `src/components/continue-watching-list/ContinueWatchingList.jsx`

- [ ] **Step 1: Write the failing test**

Add a shared marker for the mocked `Autoplay` module and expose whether Swiper received it:

```jsx
const AUTOPLAY_MODULE_MARKER = "autoplay-module";

jest.mock(
  "swiper/react",
  () => ({
    Swiper: ({
      autoplay,
      children,
      className,
      grabCursor,
      modules,
      slidesPerView,
      spaceBetween,
      ...props
    }) => (
      <div
        {...props}
        className={className ? `swiper ${className}` : "swiper"}
        data-has-autoplay-module={modules?.includes(AUTOPLAY_MODULE_MARKER) ? "true" : "false"}
        data-slides-per-view={slidesPerView}
      >
        {children}
      </div>
    ),
    SwiperSlide: ({ children }) => <div className="swiper-slide">{children}</div>,
  }),
  { virtual: true },
);

jest.mock(
  "swiper/modules",
  () => ({
    Autoplay: AUTOPLAY_MODULE_MARKER,
  }),
  { virtual: true },
);
```

Extend the existing render test assertion:

```jsx
expect(screen.getByTestId("continue-watching-carousel")).toHaveAttribute(
  "data-has-autoplay-module",
  "true",
);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- ContinueWatchingList.test.jsx --runInBand`

Expected: FAIL because `data-has-autoplay-module` is `false`.

- [ ] **Step 3: Write minimal implementation**

Update `ContinueWatchingList.jsx`:

```jsx
import { Autoplay } from "swiper/modules";
```

Update the `Swiper` props:

```jsx
<Swiper
  modules={[Autoplay]}
  className="continue-watching-list__carousel"
  data-testid="continue-watching-carousel"
  grabCursor={true}
  spaceBetween={12}
  slidesPerView="auto"
  autoplay={{ delay: 4000 }}
>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- ContinueWatchingList.test.jsx --runInBand`

Expected: PASS.

- [ ] **Step 5: Run comparison carousel tests**

Run: `npm test -- MovieList.test.jsx ContinueWatchingList.test.jsx --runInBand`

Expected: PASS.
