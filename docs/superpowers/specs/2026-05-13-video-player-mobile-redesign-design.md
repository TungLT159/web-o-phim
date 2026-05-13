# Video Player Mobile Redesign Design

## Goal

Fix mobile fullscreen, improve mobile player UI, and make the desktop center play button reliably clickable.

## Root Cause

- Mobile fullscreen currently requests fullscreen on the wrapper. iOS Safari often only supports `video.webkitEnterFullscreen()` for media fullscreen.
- The center play button competes with the full-surface hit area and touch/click guards, making click behavior inconsistent.
- Mobile chrome is a compressed desktop layout, which makes controls crowded and visually noisy.

## Design

- Fullscreen button tries `video.webkitEnterFullscreen()`, then `player.requestFullscreen()`, then `video.requestFullscreen()`.
- Center play button stops event propagation and calls play/pause directly so the surface hit area cannot consume it.
- Mobile controls become a compact bottom sheet with progress on one row and four large controls below: rewind, play/pause, forward, fullscreen.
- Mobile hides title/episode metadata and volume controls.
- Double-tap feedback remains but becomes smaller and offset away from the control bar.

## Verification

- Add tests for fullscreen fallback and center play after touch.
- Keep existing touch/click and double tap tests passing.
- Run full tests and production build.
