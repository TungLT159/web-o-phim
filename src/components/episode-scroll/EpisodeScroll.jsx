import React, { useEffect, useMemo, useRef, useState } from "react";
import { formatEpisodeDisplayName } from "../../utils/episodeDisplayName";
import "./episode-scroll.scss";

const VIRTUAL_ITEM_LIMIT = 40;
const DEFAULT_COLUMNS = 8;
const DEFAULT_VISIBLE_ROWS = 6;
const EPISODE_ROW_HEIGHT = 60;
const EPISODE_ROW_GAP = 12;
const VIRTUAL_OVERSCAN_ROWS = 2;

const getEpisodeIdentity = (episode) =>
  episode?.episodeKey ||
  `${episode?.episodeGroupTitle || ""}:${episode?.slug || episode?.name || ""}`;

const EpisodeScroll = ({
  episodes,
  episodeGroups = [],
  currentEpisode,
  onSelectEpisode,
}) => {
  const scrollContainerRef = useRef(null);
  const episodeListRef = useRef(null);
  const scrollFrameRef = useRef(null);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [virtualScrollTop, setVirtualScrollTop] = useState(0);
  const [virtualColumns, setVirtualColumns] = useState(DEFAULT_COLUMNS);
  const [virtualVisibleRows, setVirtualVisibleRows] = useState(
    DEFAULT_VISIBLE_ROWS,
  );
  const episodeRefs = useRef([]);

  const episodeIndexByKey = useMemo(() => {
    const indexByKey = new Map();
    episodes?.forEach((episode, index) => {
      indexByKey.set(getEpisodeIdentity(episode), index);
    });
    return indexByKey;
  }, [episodes]);

  const hasGroups = episodeGroups.length > 0;
  const currentGroupIndex = currentEpisode?.episodeGroupIndex ?? 0;
  const activeGroup = episodeGroups[activeGroupIndex];
  const currentEpisodeKey = getEpisodeIdentity(currentEpisode);

  useEffect(() => {
    if (hasGroups) {
      setActiveGroupIndex(currentGroupIndex);
    }
  }, [currentGroupIndex, hasGroups]);

  useEffect(() => {
    setVirtualScrollTop(0);
    if (episodeListRef.current) {
      episodeListRef.current.scrollTop = 0;
    }
  }, [activeGroupIndex]);

  useEffect(() => {
    const listElement = episodeListRef.current;
    if (!listElement) return undefined;

    const measureList = () => {
      const width = listElement.clientWidth || 0;
      const height = listElement.clientHeight || 0;
      const columns = width
        ? Math.max(
            1,
            Math.floor((width + EPISODE_ROW_GAP) / (80 + EPISODE_ROW_GAP)),
          )
        : DEFAULT_COLUMNS;
      const visibleRows = height
        ? Math.max(1, Math.ceil(height / (EPISODE_ROW_HEIGHT + EPISODE_ROW_GAP)))
        : DEFAULT_VISIBLE_ROWS;

      setVirtualColumns(columns);
      setVirtualVisibleRows(visibleRows);
    };

    measureList();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measureList);
      return () => window.removeEventListener("resize", measureList);
    }

    const resizeObserver = new ResizeObserver(measureList);
    resizeObserver.observe(listElement);
    return () => resizeObserver.disconnect();
  }, [activeGroupIndex, hasGroups]);

  // Tự động focus vào tập đang phát khi component mount
  useEffect(() => {
    if (currentEpisode && episodes) {
      const currentIndex = episodeIndexByKey.get(currentEpisodeKey);
      if (currentIndex !== undefined) {
        if (episodes.length > VIRTUAL_ITEM_LIMIT) {
          const activeGroupIndex = activeGroup?.episodes.findIndex(
            (episode) => getEpisodeIdentity(episode) === currentEpisodeKey,
          );
          const virtualIndex =
            activeGroupIndex !== undefined && activeGroupIndex >= 0
              ? activeGroupIndex
              : currentIndex;
          const targetTop =
            Math.floor(virtualIndex / virtualColumns) *
            (EPISODE_ROW_HEIGHT + EPISODE_ROW_GAP);
          setVirtualScrollTop(targetTop);
          if (episodeListRef.current) {
            episodeListRef.current.scrollTop = targetTop;
          }
        }

        // Scroll đến tập đang phát
        setTimeout(() => {
          episodeRefs.current[currentIndex]?.scrollIntoView?.({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
          });
        }, 100);
      }
    }
  }, [
    currentEpisode,
    currentEpisodeKey,
    activeGroup,
    episodes,
    episodeIndexByKey,
    virtualColumns,
  ]);

  // // Xử lý keyboard navigation (TV remote & keyboard)
  // useEffect(() => {
  //   const handleKeyDown = (e) => {
  //     if (!episodes || episodes.length === 0) return;

  //     // Bỏ qua nếu người dùng đang gõ trong input hoặc textarea
  //     if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
  //       return;
  //     }

  //     const currentIndex = focusedIndex >= 0 ? focusedIndex : 0;
  //     let newIndex = currentIndex;

  //     switch (e.key) {
  //       case "ArrowRight":
  //         e.preventDefault();
  //         newIndex = Math.min(currentIndex + 1, episodes.length - 1);
  //         break;
  //       case "ArrowLeft":
  //         e.preventDefault();
  //         newIndex = Math.max(currentIndex - 1, 0);
  //         break;
  //       case "ArrowDown":
  //         e.preventDefault();
  //         // Di chuyển xuống 1 hàng (giả sử 5 tập/hàng trên desktop)
  //         newIndex = Math.min(currentIndex + 5, episodes.length - 1);
  //         break;
  //       case "ArrowUp":
  //         e.preventDefault();
  //         // Di chuyển lên 1 hàng
  //         newIndex = Math.max(currentIndex - 5, 0);
  //         break;
  //       case "Enter":
  //       case " ":
  //         e.preventDefault();
  //         if (focusedIndex >= 0 && episodes[focusedIndex]) {
  //           onSelectEpisode(episodes[focusedIndex]);
  //         }
  //         break;
  //       case "Home":
  //         e.preventDefault();
  //         newIndex = 0;
  //         break;
  //       case "End":
  //         e.preventDefault();
  //         newIndex = episodes.length - 1;
  //         break;
  //       default:
  //         return;
  //     }

  //     if (newIndex !== currentIndex) {
  //       setFocusedIndex(newIndex);
  //       // Scroll đến episode được focus
  //       episodeRefs.current[newIndex]?.scrollIntoView({
  //         behavior: "smooth",
  //         block: "nearest",
  //         inline: "center",
  //       });
  //       // Focus vào button
  //       episodeRefs.current[newIndex]?.focus();
  //     }
  //   };

  //   window.addEventListener("keydown", handleKeyDown);
  //   return () => window.removeEventListener("keydown", handleKeyDown);
  // }, [episodes, focusedIndex, onSelectEpisode]);

  const handleEpisodeClick = (ep, index) => {
    onSelectEpisode(ep);
  };

  useEffect(
    () => () => {
      if (scrollFrameRef.current) {
        cancelAnimationFrame(scrollFrameRef.current);
      }
    },
    [],
  );

  const handleVirtualScroll = (event) => {
    const nextScrollTop = event.currentTarget.scrollTop;

    if (scrollFrameRef.current) {
      cancelAnimationFrame(scrollFrameRef.current);
    }

    scrollFrameRef.current = requestAnimationFrame(() => {
      setVirtualScrollTop(nextScrollTop);
      scrollFrameRef.current = null;
    });
  };

  const getVirtualWindow = (items) => {
    if (!items || items.length <= VIRTUAL_ITEM_LIMIT) {
      return {
        items: items || [],
        startIndex: 0,
        totalHeight: 0,
        offsetTop: 0,
        isVirtual: false,
      };
    }

    const rowStride = EPISODE_ROW_HEIGHT + EPISODE_ROW_GAP;
    const firstVisibleRow = Math.floor(virtualScrollTop / rowStride);
    const startRow = Math.max(0, firstVisibleRow - VIRTUAL_OVERSCAN_ROWS);
    const endRow = Math.min(
      Math.ceil(items.length / virtualColumns),
      firstVisibleRow + virtualVisibleRows + VIRTUAL_OVERSCAN_ROWS,
    );
    const startIndex = startRow * virtualColumns;
    const endIndex = Math.min(items.length, endRow * virtualColumns);

    return {
      items: items.slice(startIndex, endIndex),
      startIndex,
      totalHeight: Math.ceil(items.length / virtualColumns) * rowStride,
      offsetTop: startRow * rowStride,
      isVirtual: true,
    };
  };

  const renderEpisodeButton = (ep, index, labelPrefix = "") => {
    const episodeKey = getEpisodeIdentity(ep);
    const episodeIndex = episodeIndexByKey.get(episodeKey) ?? index;
    const isCurrent = currentEpisodeKey === episodeKey;
    const ariaLabel = `${labelPrefix}${formatEpisodeDisplayName(ep.name)}`;

    return (
      <button
        key={episodeKey || index}
        ref={(el) => (episodeRefs.current[episodeIndex] = el)}
        className={`episode-btn ${isCurrent ? "active" : ""}`}
        onClick={() => handleEpisodeClick(ep, episodeIndex)}
        tabIndex={0}
        aria-label={ariaLabel}
        aria-current={isCurrent ? "true" : "false"}
      >
        <span className="episode-btn__number">
          {formatEpisodeDisplayName(ep.name)}
        </span>
      </button>
    );
  };

  const renderEpisodeList = (items, labelPrefix = "") => {
    const virtualWindow = getVirtualWindow(items);
    const listClassName = `episode-list ${
      virtualWindow.isVirtual ? "episode-list--virtual" : ""
    }`;

    if (!virtualWindow.isVirtual) {
      return (
        <div className={listClassName} ref={episodeListRef}>
          {virtualWindow.items.map((ep, offset) =>
            renderEpisodeButton(ep, virtualWindow.startIndex + offset, labelPrefix),
          )}
        </div>
      );
    }

    return (
      <div
        className={listClassName}
        ref={episodeListRef}
        onScroll={handleVirtualScroll}
      >
        <div
          className="episode-list__virtual-spacer"
          style={{ height: virtualWindow.totalHeight }}
        >
          <div
            className="episode-list__virtual-grid"
            style={{
              gridTemplateColumns: `repeat(${virtualColumns}, minmax(0, 1fr))`,
              transform: `translateY(${virtualWindow.offsetTop}px)`,
            }}
          >
            {virtualWindow.items.map((ep, offset) =>
              renderEpisodeButton(
                ep,
                virtualWindow.startIndex + offset,
                labelPrefix,
              ),
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!episodes || episodes.length === 0) {
    return null;
  }

  return (
    <div className="episode-scroll" ref={scrollContainerRef}>
      <div className="episode-scroll__header">
        <h3 className="episode-scroll__title">Danh sách tập phim</h3>
        <span className="episode-scroll__count">{episodes.length} tập</span>
      </div>

      {hasGroups ? (
        <>
          <div
            className="episode-tabs"
            role="tablist"
            aria-label="Chọn phần phim"
          >
            {episodeGroups.map((group, groupIndex) => {
              const isActive = activeGroupIndex === groupIndex;

              return (
                <button
                  key={`${group.title}-${groupIndex}`}
                  type="button"
                  role="tab"
                  className={`episode-tab ${isActive ? "active" : ""}`}
                  aria-selected={isActive ? "true" : "false"}
                  onClick={() => setActiveGroupIndex(groupIndex)}
                >
                  <span className="episode-tab__title">{group.title}</span>
                  <span className="episode-tab__count">
                    {group.episodes.length} tập
                  </span>
                </button>
              );
            })}
          </div>

          {activeGroup && (
            <div className="episode-group episode-group--active">
              {renderEpisodeList(activeGroup.episodes, `${activeGroup.title} `)}
            </div>
          )}
        </>
      ) : (
        renderEpisodeList(episodes)
      )}

      {/* <div className="episode-scroll__hint">
        <span>💡 Dùng phím mũi tên để di chuyển, Enter để chọn</span>
      </div> */}
    </div>
  );
};

export default EpisodeScroll;
