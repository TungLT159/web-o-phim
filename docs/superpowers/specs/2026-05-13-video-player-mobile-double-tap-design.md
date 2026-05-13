# Video Player Mobile Double Tap Design

## Goal

Improve `CustomVideoPlayer` on mobile by supporting double tap seek gestures and fixing visual issues with hover states and the centered play button.

## Design

- A double tap on the left half of the video seeks backward 10 seconds.
- A double tap on the right half of the video seeks forward 10 seconds.
- A single tap on the video surface reveals controls only, preserving existing desktop click behavior and avoiding accidental play/pause conflicts on touch devices.
- After double tap seek, show a short visual feedback overlay on the tapped side with `-10s` or `+10s`.
- Hover transforms should apply only on pointer devices that actually support hover, preventing sticky hover UI on mobile.
- The center play button should remain visually centered by separating center positioning from hover scaling and by removing icon offset that makes the button look shifted.

## Files

- `src/components/video-player/CustomVideoPlayer.jsx`
- `src/components/video-player/custom-video-player.scss`
- `src/components/video-player/CustomVideoPlayer.test.jsx`

## Verification

- Add tests for left/right double tap seeking.
- Run the player test suite.
- Run the production build.
