import React from "react";
import fs from "fs";
import path from "path";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ContinueWatchingList from "./ContinueWatchingList";

const AUTOPLAY_MODULE_MARKER = "autoplay-module";
const NAVIGATION_MODULE_MARKER = "navigation-module";

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
        data-has-autoplay-module={
          modules?.includes(AUTOPLAY_MODULE_MARKER) ? "true" : "false"
        }
        data-has-navigation-module={
          modules?.includes(NAVIGATION_MODULE_MARKER) ? "true" : "false"
        }
        data-navigation-next={props.navigation?.nextEl || ""}
        data-navigation-prev={props.navigation?.prevEl || ""}
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
    Navigation: NAVIGATION_MODULE_MARKER,
  }),
  { virtual: true },
);

const WATCH_HISTORY_KEY = "ophim_watch_history:v1";
const styles = fs.readFileSync(
  path.join(__dirname, "continue-watching-list.scss"),
  "utf8",
);

const renderContinueWatchingList = () =>
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ContinueWatchingList />
    </MemoryRouter>,
  );

const seedHistory = (items) => {
  localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(items));
};

beforeEach(() => {
  localStorage.clear();
});

test("renders nothing when there is no in-progress history", () => {
  seedHistory([]);

  renderContinueWatchingList();

  expect(screen.queryByRole("heading", { name: "Tiếp tục xem" })).not.toBeInTheDocument();
});

test("renders a continue watching card linked to the resume episode", () => {
  seedHistory([
    {
      movieId: "movie-1",
      episodeName: "0:tap-1",
      currentTime: 120,
      duration: 600,
      percentage: 20,
      timestamp: "2026-05-18T00:00:00.000Z",
      movieInfo: {
        title: "Test Movie",
        poster: "/test-poster.jpg",
        slug: "test-movie",
      },
    },
  ]);

  renderContinueWatchingList();

  const heading = screen.getByRole("heading", { name: "Tiếp tục xem" });
  expect(heading).toBeInTheDocument();
  expect(heading.closest(".section__header.mb-2")).toBeInTheDocument();
  expect(heading.closest("section")).toHaveClass(
    "section",
    "mb-3",
    "continue-watching-list",
  );
  expect(screen.getByText("Test Movie")).toBeInTheDocument();
  expect(screen.getByText("Tập đang xem: Tập 1")).toBeInTheDocument();
  expect(screen.getByText("Đã xem 20%")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Test Movie/i })).toHaveAttribute(
    "href",
    "/movie/test-movie?ep=0%3Atap-1",
  );
  expect(screen.getByTestId("continue-watching-carousel")).toHaveAttribute(
    "data-slides-per-view",
    "auto",
  );
  expect(screen.getByTestId("continue-watching-carousel")).toHaveAttribute(
    "data-has-autoplay-module",
    "true",
  );
  expect(screen.getByTestId("continue-watching-carousel")).toHaveAttribute(
    "data-has-navigation-module",
    "true",
  );
  expect(screen.getByTestId("continue-watching-carousel")).toHaveAttribute(
    "data-navigation-prev",
    ".continue-watching-list__button-prev",
  );
  expect(screen.getByTestId("continue-watching-carousel")).toHaveAttribute(
    "data-navigation-next",
    ".continue-watching-list__button-next",
  );
  expect(
    document.querySelector(".continue-watching-list__button-prev .bx-chevron-left"),
  ).toBeInTheDocument();
  expect(
    document.querySelector(".continue-watching-list__button-next .bx-chevron-right"),
  ).toBeInTheDocument();
});

test("rounds progress percentage consistently", () => {
  seedHistory([
    {
      movieId: "movie-1",
      episodeName: "tap-1",
      currentTime: 122,
      duration: 600,
      percentage: 20.4,
      timestamp: "2026-05-18T00:00:00.000Z",
      movieInfo: {
        title: "Rounded Movie",
        poster: "",
        slug: "rounded-movie",
      },
    },
  ]);

  renderContinueWatchingList();

  expect(screen.getByText("Đã xem 20%")).toBeInTheDocument();
});

test("matches movie card visual style tokens while keeping continue controls", () => {
  expect(styles).toMatch(/\.continue-watching-list\s*\{/);
  expect(styles).toMatch(/&__poster[\s\S]*aspect-ratio:\s*2\s*\/\s*3/);
  expect(styles).toMatch(/&__poster[\s\S]*border-radius:\s*16px/);
  expect(styles).toMatch(/&__poster[\s\S]*margin-bottom:\s*1\.25rem/);
  expect(styles).toMatch(/&__poster[\s\S]*box-shadow:\s*0 8px 24px rgba\(0, 0, 0, 0\.4\)/);
  expect(styles).toMatch(/&__card[\s\S]*transform:\s*translateY\(-12px\) scale\(1\.03\)/);
  expect(styles).toMatch(/&__title[\s\S]*margin:\s*0/);
  expect(styles).toMatch(/&__title[\s\S]*display:\s*-webkit-box/);
  expect(styles).toMatch(/&__title[\s\S]*-webkit-line-clamp:\s*2/);
  expect(styles).toMatch(/&__title[\s\S]*min-height:\s*2\.8em/);
  expect(styles).toMatch(/&__episode-text[\s\S]*white-space:\s*nowrap/);
  expect(styles).toMatch(/&__progress-bar[\s\S]*height:\s*5px/);
});

test("continue watching carousel reserves top clearance for hover lift", () => {
  expect(styles).toMatch(/&__carousel\s*\{[\s\S]*?padding:\s*1\.5rem\s+0/);
});

test("continue watching carousel reserves horizontal lanes for navigation buttons", () => {
  expect(styles).toMatch(/&__carousel-wrapper\s*\{[\s\S]*?padding:\s*0\s+60px/);
  expect(styles).toMatch(/@include tablet\s*\{[\s\S]*?padding:\s*0\s+50px/);
  expect(styles).toMatch(/@include mobile\s*\{[\s\S]*?padding:\s*0\s+15px/);
});

test("hides carousel navigation buttons on mobile while keeping carousel breathing room", () => {
  const mobileWrapperStyles = styles.match(/&__carousel-wrapper\s*\{[\s\S]*?@include mobile\s*\{([\s\S]*?)\n\s*\}/)?.[1];
  const buttonStyles = styles.match(
    /\.swiper-button-prev,\s*\.swiper-button-next\s*\{([\s\S]*?)\n  \}/,
  )?.[1];

  expect(mobileWrapperStyles).toMatch(/padding:\s*0\s+15px/);
  expect(buttonStyles).toMatch(/@include mobile\s*\{[\s\S]*?display:\s*none/);
});
