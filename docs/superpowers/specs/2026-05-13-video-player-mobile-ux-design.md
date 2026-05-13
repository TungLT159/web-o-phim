# Video Player Mobile UX Design

## Goal

Improve `CustomVideoPlayer` mobile UX so touch interactions are predictable and controls are easier to use on small screens.

## Root Cause

- The player currently listens for touch gestures on the wrapper while the full-surface hit button still receives browser-generated click events.
- On mobile, a touch can reveal controls and then trigger a synthetic click that toggles play/pause unexpectedly.
- The desktop control layout is reused on mobile, making buttons crowded and leaving volume behavior in a context where it is not useful.

## Design

- Desktop/pointer devices keep surface click to play/pause.
- Touch devices use surface single tap only to show or hide controls.
- Touch devices use double tap on the left/right half to seek backward/forward 10 seconds.
- Synthetic click after touch is ignored so mobile taps do not accidentally play/pause.
- Controls remain clickable because taps inside `.custom-video-player__chrome` are ignored by the surface gesture handler.
- Mobile controls hide the volume group and use larger tap targets for play, seek, and fullscreen.
- Mobile chrome uses a compact, bottom-safe layout with a larger progress thumb.

## Verification

- Add tests for mobile single tap not toggling play, desktop click toggling play, and control buttons staying clickable.
- Keep existing double tap tests passing.
- Run full tests and production build.
