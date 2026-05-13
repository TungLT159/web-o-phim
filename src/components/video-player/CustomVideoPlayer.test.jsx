import React from "react";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import CustomVideoPlayer from "./CustomVideoPlayer";

const originalMatchMedia = window.matchMedia;
const originalUserAgent = window.navigator.userAgent;
const originalMaxTouchPoints = window.navigator.maxTouchPoints;
const originalInnerWidth = window.innerWidth;
const originalInnerHeight = window.innerHeight;

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  Object.defineProperty(window.navigator, "userAgent", {
    configurable: true,
    value: originalUserAgent,
  });
  Object.defineProperty(window.navigator, "maxTouchPoints", {
    configurable: true,
    value: originalMaxTouchPoints,
  });
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: originalInnerWidth,
  });
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: originalInnerHeight,
  });
});

const setMediaProperty = (element, property, value) => {
  Object.defineProperty(element, property, {
    configurable: true,
    value,
    writable: true,
  });
};

const mockCoarsePointer = (matches) => {
  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: query.includes("pointer: coarse") ? matches : false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
};

const mockInputMedia = ({ coarsePointer = false, hoverNone = false } = {}) => {
  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches:
      (query.includes("pointer: coarse") && coarsePointer) ||
      (query.includes("hover: none") && hoverNone),
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
};

const mockUserAgent = (userAgent) => {
  Object.defineProperty(window.navigator, "userAgent", {
    configurable: true,
    value: userAgent,
  });
};

const mockViewport = ({ width, height, maxTouchPoints = 0 }) => {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: height,
  });
  Object.defineProperty(window.navigator, "maxTouchPoints", {
    configurable: true,
    value: maxTouchPoints,
  });
};

const renderPlayer = () => {
  const videoRef = React.createRef();
  const view = render(
    <CustomVideoPlayer
      videoRef={videoRef}
      title="Test Movie"
      episodeName="1"
    />,
  );
  const video = view.container.querySelector("video");

  setMediaProperty(video, "duration", 120);
  setMediaProperty(video, "paused", true);
  video.play = jest.fn(() => {
    setMediaProperty(video, "paused", false);
    fireEvent(video, new Event("play"));
    return Promise.resolve();
  });
  video.pause = jest.fn(() => {
    setMediaProperty(video, "paused", true);
    fireEvent(video, new Event("pause"));
  });

  fireEvent(video, new Event("loadedmetadata"));

  return { ...view, video };
};

const renderPlayerWithEpisodeName = (episodeName) => {
  const videoRef = React.createRef();
  return render(
    <CustomVideoPlayer
      videoRef={videoRef}
      title="Test Movie"
      episodeName={episodeName}
    />,
  );
};

const mockPlayerBounds = (container) => {
  const player = container.querySelector(".custom-video-player");
  player.getBoundingClientRect = jest.fn(() => ({
    left: 0,
    right: 200,
    top: 0,
    bottom: 100,
    width: 200,
    height: 100,
  }));
  return player;
};

test("renders title, episode, and custom controls", () => {
  const { container } = renderPlayer();

  expect(screen.getByText("Test Movie")).toBeInTheDocument();
  expect(screen.getByText("Tập 1")).toBeInTheDocument();
  expect(screen.getAllByLabelText("Phát").length).toBeGreaterThan(0);
  expect(screen.getByLabelText("Tua video")).toBeInTheDocument();
  expect(container.querySelector(".custom-video-player__controls")).toHaveClass(
    "custom-video-player__controls--primary",
  );
  expect(container.querySelector(".custom-video-player__chrome")).toHaveClass(
    "custom-video-player__chrome--pass-through",
  );
  expect(container.querySelector(".custom-video-player__meta")).toHaveClass(
    "custom-video-player__meta--pass-through",
  );
});

test("uses native video controls on coarse pointer devices", () => {
  mockCoarsePointer(true);

  const { container, video } = renderPlayer();

  expect(video).toHaveAttribute("controls");
  expect(video.controls).toBe(true);
  expect(container.querySelector(".custom-video-player__chrome")).not.toBeInTheDocument();
  expect(container.querySelector(".custom-video-player__hit-area")).not.toBeInTheDocument();
});

test("uses custom controls on TV browsers even when hover is unavailable", () => {
  mockInputMedia({ hoverNone: true });
  mockUserAgent(
    "Mozilla/5.0 (Linux; Android 11; Android TV) AppleWebKit/537.36 Chrome/120 Safari/537.36",
  );

  const { container, video } = renderPlayer();

  expect(video).not.toHaveAttribute("controls");
  expect(container.querySelector(".custom-video-player__chrome")).toBeInTheDocument();
  expect(screen.getByLabelText("Tua video")).toBeInTheDocument();
});

test("uses custom controls on large non-touch screens even when hover is unavailable", () => {
  mockInputMedia({ hoverNone: true });
  mockViewport({ width: 1920, height: 1080, maxTouchPoints: 0 });

  const { container, video } = renderPlayer();

  expect(video).not.toHaveAttribute("controls");
  expect(container.querySelector(".custom-video-player__chrome")).toBeInTheDocument();
  expect(screen.getByLabelText("Tua video")).toBeInTheDocument();
});

test("does not duplicate episode prefix in player metadata", () => {
  renderPlayerWithEpisodeName("Tập 1");

  expect(screen.getByText("Tập 1")).toBeInTheDocument();
  expect(screen.queryByText("Tập Tập 1")).not.toBeInTheDocument();
});

test("plays video from the center play button", () => {
  const { video } = renderPlayer();

  fireEvent.click(screen.getByLabelText("Phát video"));

  expect(video.play).toHaveBeenCalledTimes(1);
});

test("center play button remains reliable after a prior touch", () => {
  const { container, video } = renderPlayer();
  const player = mockPlayerBounds(container);

  fireEvent.touchStart(player, { touches: [{ clientX: 100 }] });
  fireEvent.click(screen.getByLabelText("Phát video"));

  expect(video.play).toHaveBeenCalledTimes(1);
});

test("desktop fullscreen prefers the custom player container", () => {
  const { container, video } = renderPlayer();
  const player = container.querySelector(".custom-video-player");
  player.requestFullscreen = jest.fn();
  video.webkitEnterFullscreen = jest.fn();

  fireEvent.click(screen.getByLabelText("Toàn màn hình"));

  expect(player.requestFullscreen).toHaveBeenCalledTimes(1);
  expect(video.webkitEnterFullscreen).not.toHaveBeenCalled();
});

test("desktop surface click toggles playback", () => {
  const { video } = renderPlayer();

  fireEvent.click(screen.getAllByLabelText("Phát")[0]);

  expect(video.play).toHaveBeenCalledTimes(1);
});

test("touch surface tap ignores the following synthetic click", () => {
  const { container, video } = renderPlayer();
  const player = mockPlayerBounds(container);

  fireEvent.touchStart(player, { touches: [{ clientX: 100 }] });
  fireEvent.click(screen.getAllByLabelText("Phát")[0]);

  expect(video.play).not.toHaveBeenCalled();
});

test("control play button remains clickable after touch interaction", () => {
  const { container, video } = renderPlayer();
  const player = mockPlayerBounds(container);

  fireEvent.touchStart(player, { touches: [{ clientX: 100 }] });
  fireEvent.click(screen.getAllByLabelText("Phát")[1]);

  expect(video.play).toHaveBeenCalledTimes(1);
});

test("updates video time when seeking", () => {
  const { video } = renderPlayer();
  const progress = screen.getByLabelText("Tua video");

  fireEvent.change(progress, { target: { value: "45" } });

  expect(video.currentTime).toBe(45);
});

test("toggles mute", () => {
  const { video } = renderPlayer();

  fireEvent.click(screen.getByLabelText("Tắt âm"));

  expect(video.muted).toBe(true);
});

test("changes volume and mutes when volume reaches zero", () => {
  const { video } = renderPlayer();
  const volume = screen.getByLabelText("Âm lượng");

  fireEvent.change(volume, { target: { value: "0" } });

  expect(video.volume).toBe(0);
  expect(video.muted).toBe(true);
});

test("supports keyboard seek and mute shortcuts", () => {
  const { video } = renderPlayer();
  video.currentTime = 30;

  fireEvent.keyDown(window, { key: "ArrowRight" });
  expect(video.currentTime).toBe(40);

  fireEvent.keyDown(window, { key: "ArrowLeft" });
  expect(video.currentTime).toBe(30);

  fireEvent.keyDown(window, { key: "M" });
  expect(video.muted).toBe(true);
});

test("double tap on left half seeks backward 10 seconds", () => {
  const { container, video } = renderPlayer();
  const player = mockPlayerBounds(container);
  video.currentTime = 40;

  fireEvent.touchStart(player, { touches: [{ clientX: 40 }] });
  fireEvent.touchStart(player, { touches: [{ clientX: 40 }] });

  expect(video.currentTime).toBe(30);
  expect(screen.getByText("-10s")).toBeInTheDocument();
});

test("double tap on right half seeks forward 10 seconds", () => {
  const { container, video } = renderPlayer();
  const player = mockPlayerBounds(container);
  video.currentTime = 40;

  fireEvent.touchStart(player, { touches: [{ clientX: 160 }] });
  fireEvent.touchStart(player, { touches: [{ clientX: 160 }] });

  expect(video.currentTime).toBe(50);
  expect(screen.getByText("+10s")).toBeInTheDocument();
});
