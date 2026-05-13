import React, { useCallback, useEffect, useRef, useState } from "react";
import "./custom-video-player.scss";

const formatVideoTime = (value) => {
  if (!Number.isFinite(value) || value <= 0) return "00:00";

  const totalSeconds = Math.floor(value);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const CustomVideoPlayer = ({ videoRef, title, episodeName }) => {
  const playerRef = useRef(null);
  const hideControlsTimerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getVideo = useCallback(() => videoRef?.current, [videoRef]);

  const clearHideControlsTimer = useCallback(() => {
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
      hideControlsTimerRef.current = null;
    }
  }, []);

  const revealControls = useCallback(() => {
    const video = getVideo();
    setShowControls(true);
    clearHideControlsTimer();

    if (video && !video.paused) {
      hideControlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  }, [clearHideControlsTimer, getVideo]);

  const togglePlay = useCallback(() => {
    const video = getVideo();
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => setHasError(true));
    } else {
      video.pause();
    }
  }, [getVideo]);

  const seekBy = useCallback(
    (seconds) => {
      const video = getVideo();
      if (!video) return;

      const nextTime = Math.min(
        Math.max(video.currentTime + seconds, 0),
        video.duration || 0,
      );
      video.currentTime = nextTime;
      setCurrentTime(nextTime);
      revealControls();
    },
    [getVideo, revealControls],
  );

  const handleSeek = useCallback(
    (event) => {
      const video = getVideo();
      if (!video) return;

      const nextTime = Number(event.target.value);
      video.currentTime = nextTime;
      setCurrentTime(nextTime);
    },
    [getVideo],
  );

  const toggleMute = useCallback(() => {
    const video = getVideo();
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, [getVideo]);

  const handleVolumeChange = useCallback(
    (event) => {
      const video = getVideo();
      if (!video) return;

      const nextVolume = Number(event.target.value);
      video.volume = nextVolume;
      video.muted = nextVolume === 0;
      setVolume(nextVolume);
      setIsMuted(video.muted);
    },
    [getVideo],
  );

  const toggleFullscreen = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    if (!document.fullscreenElement) {
      player.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  useEffect(() => {
    const video = getVideo();
    if (!video) return undefined;

    const syncPlayback = () => {
      setIsPlaying(!video.paused);
      revealControls();
    };
    const syncTime = () => setCurrentTime(video.currentTime || 0);
    const syncDuration = () => setDuration(video.duration || 0);
    const handleWaiting = () => setIsLoading(true);
    const handleReady = () => {
      setIsLoading(false);
      setHasError(false);
      setDuration(video.duration || 0);
    };
    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
    };
    const syncVolume = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.controls = false;
    syncVolume();

    video.addEventListener("play", syncPlayback);
    video.addEventListener("pause", syncPlayback);
    video.addEventListener("timeupdate", syncTime);
    video.addEventListener("durationchange", syncDuration);
    video.addEventListener("loadedmetadata", handleReady);
    video.addEventListener("canplay", handleReady);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("error", handleError);
    video.addEventListener("volumechange", syncVolume);

    return () => {
      video.removeEventListener("play", syncPlayback);
      video.removeEventListener("pause", syncPlayback);
      video.removeEventListener("timeupdate", syncTime);
      video.removeEventListener("durationchange", syncDuration);
      video.removeEventListener("loadedmetadata", handleReady);
      video.removeEventListener("canplay", handleReady);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("error", handleError);
      video.removeEventListener("volumechange", syncVolume);
      clearHideControlsTimer();
    };
  }, [clearHideControlsTimer, getVideo, revealControls]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === playerRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const tagName = event.target?.tagName;
      if (
        tagName === "INPUT" ||
        tagName === "TEXTAREA" ||
        event.target?.isContentEditable
      ) {
        return;
      }

      if ([" ", "ArrowLeft", "ArrowRight", "m", "M", "f", "F"].includes(event.key)) {
        event.preventDefault();
      }

      switch (event.key) {
        case " ":
          togglePlay();
          break;
        case "ArrowLeft":
          seekBy(-10);
          break;
        case "ArrowRight":
          seekBy(10);
          break;
        case "m":
        case "M":
          toggleMute();
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [seekBy, toggleFullscreen, toggleMute, togglePlay]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercent = `${(isMuted ? 0 : volume) * 100}%`;
  const volumeIcon = isMuted || volume === 0 ? "bx-volume-mute" : "bx-volume-full";

  return (
    <div
      ref={playerRef}
      className={`custom-video-player ${
        showControls || !isPlaying ? "is-active" : "is-idle"
      }`}
      onMouseMove={revealControls}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onTouchStart={revealControls}
    >
      <video ref={videoRef} autoPlay playsInline controlsList="nodownload">
        Trình duyệt của bạn không hỗ trợ video HTML5.
      </video>

      <button
        className="custom-video-player__hit-area"
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? "Tạm dừng" : "Phát"}
      />

      {isLoading && !hasError && (
        <div className="custom-video-player__state custom-video-player__state--loading">
          <span className="custom-video-player__spinner" />
          <span>Đang tải video...</span>
        </div>
      )}

      {hasError && (
        <div className="custom-video-player__state custom-video-player__state--error">
          <i className="bx bx-error-circle" />
          <strong>Không thể phát video</strong>
          <span>Vui lòng thử lại sau hoặc chọn tập khác.</span>
        </div>
      )}

      {!isPlaying && !hasError && (
        <button
          className="custom-video-player__center-play"
          type="button"
          onClick={togglePlay}
          aria-label="Phát video"
        >
          <i className="bx bx-play" />
        </button>
      )}

      <div
        className="custom-video-player__chrome"
        aria-hidden={!showControls && isPlaying}
      >
        <div className="custom-video-player__meta">
          <span>{title || "Đang xem phim"}</span>
          {episodeName && <strong>Tập {episodeName}</strong>}
        </div>

        <div className="custom-video-player__progress-row">
          <span>{formatVideoTime(currentTime)}</span>
          <input
            className="custom-video-player__progress"
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            aria-label="Tua video"
            style={{ "--progress": `${progressPercent}%` }}
          />
          <span>{formatVideoTime(duration)}</span>
        </div>

        <div className="custom-video-player__controls">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? "Tạm dừng" : "Phát"}
          >
            <i className={`bx ${isPlaying ? "bx-pause" : "bx-play"}`} />
          </button>
          <button
            type="button"
            onClick={() => seekBy(-10)}
            aria-label="Tua lùi 10 giây"
          >
            <i className="bx bx-rewind" />
            <span>10</span>
          </button>
          <button
            type="button"
            onClick={() => seekBy(10)}
            aria-label="Tua tới 10 giây"
          >
            <i className="bx bx-fast-forward" />
            <span>10</span>
          </button>
          <div className="custom-video-player__volume">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? "Bật âm" : "Tắt âm"}
            >
              <i className={`bx ${volumeIcon}`} />
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              aria-label="Âm lượng"
              style={{ "--progress": volumePercent }}
            />
          </div>
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
          >
            <i className={`bx ${isFullscreen ? "bx-exit-fullscreen" : "bx-fullscreen"}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomVideoPlayer;
