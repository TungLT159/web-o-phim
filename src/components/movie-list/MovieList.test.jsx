import React from "react";
import fs from "fs";
import path from "path";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MovieList from "./MovieList";
import tmdbApi from "../../api/tmdbApi";

const styles = fs.readFileSync(path.join(__dirname, "movie-list.scss"), "utf8");

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
    Autoplay: {},
  }),
  { virtual: true },
);

jest.mock("../../api/tmdbApi", () => ({
  getMoviesList: jest.fn(),
  getListByType: jest.fn(),
}));

jest.mock("../../utils/tmdbImageFetcher", () => ({
  fetchTMDBImages: jest.fn().mockResolvedValue({ posterUrl: "/poster-mau.png" }),
}));

const renderMovieList = () =>
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <MovieList category="movie" type="popular" />
    </MemoryRouter>,
  );

test("reserves carousel card space while movies are loading", () => {
  tmdbApi.getMoviesList.mockReturnValue(new Promise(() => {}));

  renderMovieList();

  const placeholders = screen.getAllByTestId("movie-list-skeleton-card");
  expect(placeholders).toHaveLength(6);
  expect(screen.getByTestId("movie-list-carousel")).toHaveClass("movie-list--loading");
});

test("keeps placeholder card space when the movie response is empty", async () => {
  tmdbApi.getMoviesList.mockResolvedValue({ data: { items: [] } });

  renderMovieList();

  await waitFor(() =>
    expect(screen.getByTestId("movie-list-carousel")).toHaveClass(
      "movie-list--empty",
    ),
  );

  const placeholders = screen.getAllByTestId("movie-list-skeleton-card");
  expect(placeholders).toHaveLength(6);
  expect(screen.getByTestId("movie-list-carousel")).toHaveClass("movie-list--empty");
});

test("movie carousel reserves top clearance for hover lift", () => {
  expect(styles).toMatch(/\.movie-list\s*\{[\s\S]*?\.swiper\s*\{[\s\S]*?padding:\s*1\.5rem\s+0/);
  expect(styles).not.toMatch(/\.swiper-container\s*\{[\s\S]*?padding:\s*1rem\s+0/);
});
