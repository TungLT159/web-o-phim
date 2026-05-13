import React from "react";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import CustomVideoPlayer from "./CustomVideoPlayer";

const setMediaProperty = (element, property, value) => {
  Object.defineProperty(element, property, {
    configurable: true,
    value,
    writable: true,
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

test("renders title, episode, and custom controls", () => {
  renderPlayer();

  expect(screen.getByText("Test Movie")).toBeInTheDocument();
  expect(screen.getByText("Tập 1")).toBeInTheDocument();
  expect(screen.getAllByLabelText("Phát").length).toBeGreaterThan(0);
  expect(screen.getByLabelText("Tua video")).toBeInTheDocument();
});

test("plays video from the center play button", () => {
  const { video } = renderPlayer();

  fireEvent.click(screen.getByLabelText("Phát video"));

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
