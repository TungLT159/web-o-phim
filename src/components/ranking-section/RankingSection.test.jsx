import React from "react";
import "@testing-library/jest-dom";
import fs from "fs";
import path from "path";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RankingSection from "./RankingSection";
import { fetchTMDBImages } from "../../utils/tmdbImageFetcher";

jest.mock(
  "swiper/react",
  () => ({
    Swiper: ({ children, className }) => (
      <div className={className ? `swiper ${className}` : "swiper"}>{children}</div>
    ),
    SwiperSlide: ({ children }) => <div className="swiper-slide">{children}</div>,
  }),
  { virtual: true },
);

jest.mock(
  "swiper/modules",
  () => ({
    Navigation: {},
    Pagination: {},
    Autoplay: {},
  }),
  { virtual: true },
);

jest.mock("swiper/css", () => ({}), { virtual: true });
jest.mock("swiper/css/bundle", () => ({}), { virtual: true });

jest.mock("../../utils/tmdbImageFetcher", () => ({
  fetchTMDBImages: jest.fn(),
}));

const movies = [
  { slug: "first", name: "First", tmdb: { id: 1 } },
  { slug: "second", name: "Second", tmdb: { id: 2 } },
];

const renderRankingSection = (props) =>
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <RankingSection
        title="Top phim"
        icon="bx bx-trending-up"
        type="weekly"
        {...props}
      />
    </MemoryRouter>,
  );

const rankingSectionStyles = fs.readFileSync(
  path.join(__dirname, "ranking-section.scss"),
  "utf8",
);

const expectSkeletonBreakpoint = (styles, minWidth, columns, hiddenFrom) => {
  const blockPattern = new RegExp(
    `@media\\s*\\(min-width:\\s*${minWidth}px\\)\\s*\\{[\\s\\S]*?grid-template-columns:\\s*repeat\\(${columns},\\s*minmax\\(0,\\s*1fr\\)\\)[\\s\\S]*?ranking-section__skeleton-card:nth-child\\(n \\+ ${hiddenFrom}\\)`,
  );

  expect(styles).toMatch(blockPattern);
};

test("ranking skeleton breakpoints mirror Swiper slidesPerView", () => {
  expect(rankingSectionStyles).toMatch(
    /&__loading-slider\s*\{[\s\S]*?grid-template-columns:\s*1fr[\s\S]*?ranking-section__skeleton-card:nth-child\(n \+ 2\)/,
  );

  expectSkeletonBreakpoint(rankingSectionStyles, 640, 2, 3);
  expectSkeletonBreakpoint(rankingSectionStyles, 768, 3, 4);
  expectSkeletonBreakpoint(rankingSectionStyles, 1024, 4, 5);
  expectSkeletonBreakpoint(rankingSectionStyles, 1280, 5, 6);
});

test("reserves ranking card space while movie images are loading", () => {
  fetchTMDBImages.mockReturnValue(new Promise(() => {}));

  renderRankingSection({ movies });

  const placeholders = screen.getAllByTestId("ranking-skeleton-card");
  expect(placeholders).toHaveLength(5);
  expect(screen.getByTestId("ranking-slider-placeholder")).toHaveClass(
    "ranking-section__loading-slider",
  );
});

test.each([undefined, []])(
  "reserves ranking card space when movies is %s",
  (emptyMovies) => {
    renderRankingSection({ movies: emptyMovies });

    expect(screen.getAllByTestId("ranking-skeleton-card")).toHaveLength(5);
    expect(screen.getByTestId("ranking-slider-placeholder")).toHaveClass(
      "ranking-section__loading-slider",
    );
  },
);

test("shows ranking placeholders again while changed movies load", async () => {
  fetchTMDBImages.mockResolvedValueOnce({ posterUrl: "/first.jpg" });

  const { rerender } = renderRankingSection({ movies: [movies[0]] });

  await screen.findByText("First");

  fetchTMDBImages.mockReturnValue(new Promise(() => {}));

  rerender(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <RankingSection
        title="Top phim"
        icon="bx bx-trending-up"
        type="weekly"
        movies={[movies[1]]}
      />
    </MemoryRouter>,
  );

  await waitFor(() =>
    expect(screen.getAllByTestId("ranking-skeleton-card")).toHaveLength(5),
  );
});
