# Video Player Hybrid Touch Design

## Goal

Keep custom progress and icon controls on mobile/tablet touch devices while making the UI simpler and more reliable. Improve desktop center play click reliability.

## Design

- Touch devices use a simplified custom overlay instead of the full desktop chrome.
- Touch overlay keeps only progress, time, and icons: rewind 10 seconds, play/pause, forward 10 seconds, fullscreen.
- Touch overlay hides metadata and volume.
- Touch surface single tap only reveals controls; control buttons handle playback and fullscreen.
- Fullscreen keeps mobile fallback order: `video.webkitEnterFullscreen()`, `player.requestFullscreen()`, `video.requestFullscreen()`.
- Desktop keeps the richer custom player UI.
- Desktop center play button stays above the hit area and uses an isolated click handler.

## Verification

- Add tests for touch-specific CSS hooks and center play reliability where possible.
- Keep existing fullscreen, synthetic click, desktop click, seek, and keyboard tests passing.
- Run full tests and production build.
