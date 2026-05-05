import React, { useEffect, useRef, useState } from "react";
import "./episode-scroll.scss";

const EpisodeScroll = ({ episodes, currentEpisode, onSelectEpisode }) => {
  const scrollContainerRef = useRef(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const episodeRefs = useRef([]);

  // Tự động focus vào tập đang phát khi component mount
  useEffect(() => {
    if (currentEpisode && episodes) {
      const currentIndex = episodes.findIndex(
        (ep) => ep.name === currentEpisode.name
      );
      if (currentIndex !== -1) {
        setFocusedIndex(currentIndex);
        // Scroll đến tập đang phát
        setTimeout(() => {
          episodeRefs.current[currentIndex]?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
          });
        }, 100);
      }
    }
  }, [currentEpisode, episodes]);

  // Xử lý keyboard navigation (TV remote & keyboard)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!episodes || episodes.length === 0) return;

      const currentIndex = focusedIndex >= 0 ? focusedIndex : 0;
      let newIndex = currentIndex;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          newIndex = Math.min(currentIndex + 1, episodes.length - 1);
          break;
        case "ArrowLeft":
          e.preventDefault();
          newIndex = Math.max(currentIndex - 1, 0);
          break;
        case "ArrowDown":
          e.preventDefault();
          // Di chuyển xuống 1 hàng (giả sử 5 tập/hàng trên desktop)
          newIndex = Math.min(currentIndex + 5, episodes.length - 1);
          break;
        case "ArrowUp":
          e.preventDefault();
          // Di chuyển lên 1 hàng
          newIndex = Math.max(currentIndex - 5, 0);
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (focusedIndex >= 0 && episodes[focusedIndex]) {
            onSelectEpisode(episodes[focusedIndex]);
          }
          break;
        case "Home":
          e.preventDefault();
          newIndex = 0;
          break;
        case "End":
          e.preventDefault();
          newIndex = episodes.length - 1;
          break;
        default:
          return;
      }

      if (newIndex !== currentIndex) {
        setFocusedIndex(newIndex);
        // Scroll đến episode được focus
        episodeRefs.current[newIndex]?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
        // Focus vào button
        episodeRefs.current[newIndex]?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [episodes, focusedIndex, onSelectEpisode]);

  const handleEpisodeClick = (ep, index) => {
    setFocusedIndex(index);
    onSelectEpisode(ep);
  };

  const handleEpisodeFocus = (index) => {
    setFocusedIndex(index);
  };

  if (!episodes || episodes.length === 0) {
    return null;
  }

  return (
    <div className="episode-scroll" ref={scrollContainerRef}>
      <div className="episode-scroll__header">
        <h3 className="episode-scroll__title">Danh sách tập phim</h3>
        <span className="episode-scroll__count">
          {episodes.length} tập
        </span>
      </div>

      <div className="episode-list">
        {episodes.map((ep, index) => (
          <button
            key={index}
            ref={(el) => (episodeRefs.current[index] = el)}
            className={`episode-btn ${
              currentEpisode?.name === ep.name ? "active" : ""
            } ${focusedIndex === index ? "focused" : ""}`}
            onClick={() => handleEpisodeClick(ep, index)}
            onFocus={() => handleEpisodeFocus(index)}
            tabIndex={0}
            aria-label={`Tập ${ep.name}`}
            aria-current={currentEpisode?.name === ep.name ? "true" : "false"}
          >
            <span className="episode-btn__number">Tập {ep.name}</span>
          </button>
        ))}
      </div>

      <div className="episode-scroll__hint">
        <span>💡 Dùng phím mũi tên để di chuyển, Enter để chọn</span>
      </div>
    </div>
  );
};

export default EpisodeScroll;
