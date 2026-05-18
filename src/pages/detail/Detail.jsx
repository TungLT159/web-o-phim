import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { fetchTMDBImages } from "../../utils/tmdbImageFetcher";
import {
  saveWatchProgress,
  getWatchProgress,
  shouldShowContinueWatching,
  formatTime,
} from "../../utils/watchHistoryManager";
import "./detail.scss";
import { Helmet } from "react-helmet";
import SimilarMovies from "../../components/similar-movies/SimilarMovies";
import EpisodeScroll from "../../components/episode-scroll/EpisodeScroll";
import CustomVideoPlayer from "../../components/video-player/CustomVideoPlayer";
import { formatEpisodeDisplayName } from "../../utils/episodeDisplayName";
import { useMovieDetail } from "./useMovieDetail";
import { getEpisodeIdentity, useEpisodeCatalog } from "./useEpisodeCatalog";
import { useEpisodePlayback } from "./useEpisodePlayback";

const getEpisodeProgressKey = (episode) => getEpisodeIdentity(episode);
const AUTO_PLAY_STORAGE_KEY = "autoPlayEnabled:v1";
const LEGACY_AUTO_PLAY_STORAGE_KEY = "autoPlayEnabled";

const getEpisodeProgressKeysForRead = (episode) => {
  const progressKey = getEpisodeProgressKey(episode);
  if (!progressKey) return [];

  return episode?.name && episode.name !== progressKey
    ? [progressKey, episode.name]
    : [progressKey];
};

const runWhenIdle = (callback) => {
  if (typeof window !== "undefined" && window.requestIdleCallback) {
    const idleId = window.requestIdleCallback(callback, { timeout: 1500 });
    return () => window.cancelIdleCallback?.(idleId);
  }

  const timeoutId = setTimeout(callback, 1500);
  return () => clearTimeout(timeoutId);
};

const Detail = () => {
  const { category, id } = useParams();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  const { item, loadError } = useMovieDetail(category, id);
  const [poster_url, setPosterUrl] = useState("/poster-mau.png");
  const [backdrop_url, setBackdropUrl] = useState("");
  const [overview, setOverview] = useState("");
  const [autoPlayCountdown, setAutoPlayCountdown] = useState(null);
  const [showAutoPlayNotice, setShowAutoPlayNotice] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(() => {
    // Lấy từ localStorage, mặc định là true
    const saved =
      localStorage.getItem(AUTO_PLAY_STORAGE_KEY) ??
      localStorage.getItem(LEGACY_AUTO_PLAY_STORAGE_KEY);
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Watch history states
  const [showContinueWatching, setShowContinueWatching] = useState(false);
  const [savedProgress, setSavedProgress] = useState(null);
  const [showSecondaryContent, setShowSecondaryContent] = useState(false);
  const saveProgressIntervalRef = useRef(null);

  const videoRef = useRef(null);
  const autoPlayTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // ✅ Lấy episode từ URL param nếu có
  const query = new URLSearchParams(search);
  const epFromUrl = query.get("ep");
  const {
    episodeGroups,
    episodeList,
    currentEpisode: currentEp,
    currentEpisodeIndex,
    selectEpisode,
  } = useEpisodeCatalog(item, epFromUrl);

  const currentEpisodeDisplayName = currentEp
    ? formatEpisodeDisplayName(currentEp.name)
    : "";
  const nextEpisode =
    currentEpisodeIndex >= 0 ? episodeList[currentEpisodeIndex + 1] : null;
  const { playbackError } = useEpisodePlayback({
    movieId: id,
    episode: currentEp,
    nextEpisode,
    videoRef,
  });

  // ✅ Clear auto-play timers
  const clearAutoPlayTimers = useCallback(() => {
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setAutoPlayCountdown(null);
    setShowAutoPlayNotice(false);
  }, []);

  // ✅ Toggle auto-play setting
  const handleToggleAutoPlay = useCallback(() => {
    const newValue = !autoPlayEnabled;
    setAutoPlayEnabled(newValue);
    localStorage.setItem(AUTO_PLAY_STORAGE_KEY, JSON.stringify(newValue));

    // Nếu tắt auto-play, clear timers hiện tại
    if (!newValue) {
      clearAutoPlayTimers();
    }
  }, [autoPlayEnabled, clearAutoPlayTimers]);

  // ✅ Memoize genres list
  const genresList = useMemo(() => {
    if (!item?.category) return null;
    return item.category.slice(0, 5).map((genre) => (
      <span key={genre.slug ?? genre.name} className="genres__item">
        {genre.name}
      </span>
    ));
  }, [item?.category]);

  // ✅ Memoize movie tags
  const movieTags = useMemo(() => {
    if (!item) return null;
    return (
      <div className="movie-tags">
        {item.quality && (
          <span className="tag">Chất lượng: {item.quality}</span>
        )}
        {item.lang && <span className="tag">Ngôn ngữ: {item.lang}</span>}
        {item.time && <span className="tag">Thời lượng: {item.time}</span>}
        {item.episode_total != null && (
          <span className="tag">Số tập: {item.episode_total}</span>
        )}
        {item.episode_current && (
          <span className="tag">Tình trạng: {item.episode_current}</span>
        )}
        {item.year != null && <span className="tag">Năm: {item.year}</span>}
      </div>
    );
  }, [item]);

  // ✅ Memoize video source URL
  const videoSource = useMemo(() => {
    if (item?.episode_current === "Trailer") {
      return item.trailer_url?.replace("watch?v=", "embed/");
    }
    return null;
  }, [item]);

  useEffect(() => {
    clearAutoPlayTimers();
    setShowContinueWatching(false);
    setSavedProgress(null);

    if (!currentEp) return;

    const progress = getEpisodeProgressKeysForRead(currentEp)
      .map((episodeKey) => getWatchProgress(id, episodeKey))
      .find(Boolean);
    if (
      progress &&
      shouldShowContinueWatching(progress.currentTime, progress.duration)
    ) {
      setSavedProgress(progress);
      setShowContinueWatching(true);
    }
  }, [clearAutoPlayTimers, currentEp, id]);

  useEffect(() => {
    let isCancelled = false;

    const loadImages = async () => {
      if (!id || !item?.tmdb) return;
      const {
        posterUrl,
        backdropUrl,
        overview: tmdbOverview,
      } = await fetchTMDBImages(item.tmdb);

      if (isCancelled) return;

      setPosterUrl(posterUrl);
      setBackdropUrl(backdropUrl);
      setOverview(tmdbOverview);
    };

    const cancelIdle = runWhenIdle(loadImages);
    return () => {
      isCancelled = true;
      cancelIdle();
    };
  }, [id, item?.tmdb]);

  useEffect(() => {
    if (!item) return undefined;

    setShowSecondaryContent(false);
    return runWhenIdle(() => setShowSecondaryContent(true));
  }, [item]);

  // ✅ Khi chọn tập → cập nhật state và URL
  const handleSelectEpisode = useCallback(
    (ep) => {
      selectEpisode(ep);

      // cập nhật URL param
      const searchParams = new URLSearchParams(search);
      searchParams.set("ep", getEpisodeIdentity(ep));
      navigate(
        {
          pathname,
          search: searchParams.toString(),
        },
        { replace: true },
      );

      // Cuộn về video
      if (videoRef.current) {
        videoRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    },
    [search, pathname, navigate, selectEpisode],
  );

  // ✅ Navigate to previous episode
  const handlePrevEpisode = useCallback(() => {
    if (currentEpisodeIndex > 0) {
      const prevEp = episodeList[currentEpisodeIndex - 1];
      handleSelectEpisode(prevEp);
    }
  }, [currentEpisodeIndex, episodeList, handleSelectEpisode]);

  // ✅ Navigate to next episode
  const handleNextEpisode = useCallback(() => {
    if (
      currentEpisodeIndex !== -1 &&
      currentEpisodeIndex < episodeList.length - 1
    ) {
      const nextEp = episodeList[currentEpisodeIndex + 1];
      handleSelectEpisode(nextEp);
    }
  }, [currentEpisodeIndex, episodeList, handleSelectEpisode]);

  // ✅ Cancel auto-play
  const handleCancelAutoPlay = useCallback(() => {
    clearAutoPlayTimers();
  }, [clearAutoPlayTimers]);

  // ✅ Handle continue watching
  const handleContinueWatching = useCallback(() => {
    const video = videoRef.current;
    if (video && savedProgress) {
      video.currentTime = savedProgress.currentTime;
      setShowContinueWatching(false);
      setSavedProgress(null);
    }
  }, [savedProgress]);

  // ✅ Handle start from beginning
  const handleStartFromBeginning = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      setShowContinueWatching(false);
      setSavedProgress(null);
    }
  }, []);

  // ✅ Auto-play next episode when video is near end
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hasTriggeredAutoPlay = false;

    const persistCurrentProgress = () => {
      const currentVideo = videoRef.current || video;
      if (
        currentVideo &&
        currentEp &&
        item &&
        currentVideo.currentTime > 0 &&
        currentVideo.duration > 0
      ) {
        saveWatchProgress(
          id,
          getEpisodeProgressKey(currentEp),
          currentVideo.currentTime,
          currentVideo.duration,
          {
            title: item.title || item.name,
            poster: poster_url,
            slug: item.slug,
          },
        );
      }
    };

    const handlePageHide = () => {
      persistCurrentProgress();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        persistCurrentProgress();
      }
    };

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      const duration = video.duration;

      // Lưu watch progress mỗi 5 giây
      if (currentTime > 0 && duration > 0) {
        if (!saveProgressIntervalRef.current) {
          saveProgressIntervalRef.current = setInterval(() => {
            persistCurrentProgress();
          }, 5000);
        }
      }

      // Kiểm tra nếu video còn 25 giây cuối và chưa trigger
      if (
        duration - currentTime <= 25 &&
        !hasTriggeredAutoPlay &&
        autoPlayEnabled
      ) {
        if (
          currentEpisodeIndex !== -1 &&
          currentEpisodeIndex < episodeList.length - 1
        ) {
          hasTriggeredAutoPlay = true;

          // Hiện thông báo tự động phát
          setShowAutoPlayNotice(true);
          setAutoPlayCountdown(10);

          // Countdown interval
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = setInterval(() => {
            setAutoPlayCountdown((prev) => {
              if (prev <= 1) {
                clearAutoPlayTimers();
                handleNextEpisode();
                return null;
              }
              return prev - 1;
            });
          }, 1000);
        }
      }
    };

    const handleVideoEnded = () => {
      if (
        autoPlayEnabled &&
        currentEpisodeIndex !== -1 &&
        currentEpisodeIndex < episodeList.length - 1
      ) {
        // Tự động phát tập tiếp theo ngay lập tức khi video kết thúc
        handleNextEpisode();
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleVideoEnded);
    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      persistCurrentProgress();
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleVideoEnded);
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearAutoPlayTimers();

      // Clear save progress interval
      if (saveProgressIntervalRef.current) {
        clearInterval(saveProgressIntervalRef.current);
        saveProgressIntervalRef.current = null;
      }
    };
  }, [
    currentEp,
    item,
    autoPlayEnabled,
    id,
    poster_url,
    episodeList,
    currentEpisodeIndex,
    clearAutoPlayTimers,
    handleNextEpisode,
  ]);

  // Get absolute image URL for social sharing
  const getAbsoluteImageUrl = useCallback((imageUrl) => {
    if (!imageUrl) return `${window.location.origin}/poster-mau.png`;
    if (imageUrl.startsWith("http")) return imageUrl;
    return `${window.location.origin}${imageUrl}`;
  }, []);

  // Generate structured data for SEO
  const structuredData = useMemo(() => {
    if (!item) return null;

    return {
      "@context": "https://schema.org",
      "@type": "Movie",
      name: item.title || item.name,
      description: overview || item.content?.replace(/<[^>]+>/g, ""),
      image: getAbsoluteImageUrl(poster_url),
      datePublished: item.year,
      genre: item.category?.map((cat) => cat.name).join(", "),
      contentRating: item.quality,
      inLanguage: item.lang || "vi",
      duration: item.time,
      aggregateRating: item.tmdb?.vote_average
        ? {
            "@type": "AggregateRating",
            ratingValue: item.tmdb.vote_average,
            ratingCount: item.tmdb.vote_count,
          }
        : undefined,
    };
  }, [item, overview, poster_url, getAbsoluteImageUrl]);

  const isLoadingDetail = !item && !loadError;

  return (
    <>
      {loadError && (
        <div className="container" style={{ padding: "120px 0 60px" }}>
          <h2>{loadError}</h2>
        </div>
      )}
      {isLoadingDetail && (
        <div
          className="detail-loading"
          role="status"
          aria-label="Đang tải phim"
        >
          <div className="banner detail-loading__banner"></div>

          <div className="mb-3 movie-content container detail-loading__content">
            <div className="movie-content__poster">
              <div className="movie-content__poster__img detail-loading__poster"></div>
            </div>
            <div className="movie-content__info detail-loading__info">
              <div className="detail-loading__line detail-loading__title"></div>
              <div className="detail-loading__chips">
                <span className="detail-loading__chip"></span>
                <span className="detail-loading__chip"></span>
                <span className="detail-loading__chip"></span>
              </div>
              <div className="detail-loading__tags">
                <span className="detail-loading__tag"></span>
                <span className="detail-loading__tag"></span>
                <span className="detail-loading__tag"></span>
              </div>
              <div className="detail-loading__line"></div>
              <div className="detail-loading__line detail-loading__line--wide"></div>
              <div className="detail-loading__line detail-loading__line--short"></div>
            </div>
          </div>

          <div className="container">
            <div className="section mb-3">
              <div className="watch-section detail-loading__watch">
                <div className="video-player">
                  <div className="video-wrapper detail-loading__video"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {item && (
        <>
          <Helmet>
            <title>
              {`${item.title || item.name} ${
                currentEp ? `- ${currentEpisodeDisplayName}` : ""
              } | Ổ Phim`}
            </title>
            <meta
              name="description"
              content={
                overview ||
                item.content?.replace(/<[^>]+>/g, "") ||
                "Xem phim online chất lượng HD"
              }
            />
            <meta
              name="keywords"
              content={`${item.title || item.name}, xem phim ${item.title || item.name}, ${item.category?.map((c) => c.name).join(", ")}, phim ${item.year}`}
            />
            <link rel="icon" href="/logo.png" />
            <link
              rel="canonical"
              href={`${window.location.origin}/movie/${id}${currentEp ? `?ep=${getEpisodeIdentity(currentEp)}` : ""}`}
            />

            {/* Open Graph */}
            <meta property="og:type" content="video.movie" />
            <meta
              property="og:title"
              content={`${item.title || item.name} ${currentEp ? `- ${currentEpisodeDisplayName}` : ""}`}
            />
            <meta
              property="og:description"
              content={
                overview ||
                item.content?.replace(/<[^>]+>/g, "") ||
                "Xem phim online chất lượng HD"
              }
            />
            <meta
              property="og:image"
              content={getAbsoluteImageUrl(poster_url)}
            />
            <meta
              property="og:image:secure_url"
              content={getAbsoluteImageUrl(poster_url)}
            />
            <meta property="og:image:width" content="500" />
            <meta property="og:image:height" content="750" />
            <meta
              property="og:image:alt"
              content={`Poster phim ${item.title || item.name}`}
            />
            <meta property="og:image:type" content="image/jpeg" />
            <meta
              property="og:url"
              content={`${window.location.origin}/movie/${id}`}
            />
            <meta property="og:site_name" content="Ổ Phim" />
            <meta property="og:locale" content="vi_VN" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta
              name="twitter:title"
              content={`${item.title || item.name} ${currentEp ? `- ${currentEpisodeDisplayName}` : ""}`}
            />
            <meta
              name="twitter:description"
              content={
                overview ||
                item.content?.replace(/<[^>]+>/g, "") ||
                "Xem phim online chất lượng HD"
              }
            />
            <meta
              name="twitter:image"
              content={getAbsoluteImageUrl(poster_url)}
            />
            <meta
              name="twitter:image:alt"
              content={`Poster phim ${item.title || item.name}`}
            />

            {/* Structured Data */}
            {structuredData && (
              <script type="application/ld+json">
                {JSON.stringify(structuredData)}
              </script>
            )}
          </Helmet>

          <div
            className="banner"
            style={{ backgroundImage: `url(${backdrop_url})` }}
          ></div>

          <div className="mb-3 movie-content container">
            <div className="movie-content__poster">
              <div
                className="movie-content__poster__img"
                style={{ backgroundImage: `url(${poster_url})` }}
              ></div>
            </div>
            <div className="movie-content__info">
              <h1 className="title">
                {item.title || item.name}{" "}
                {currentEp ? `- ${currentEpisodeDisplayName}` : ""}
              </h1>
              <div className="genres">{genresList}</div>
              {/* ✅ Thêm các tag thông tin */}
              {movieTags}

              {/* genres, tags, mô tả giữ nguyên */}
              <p className="overview">
                {overview ? overview : item.content?.replace(/<[^>]+>/g, "")}
              </p>
            </div>
          </div>

          <div className="container">
            <div className="section mb-3">
              <div className="watch-section">
                <div className="video-player">
                  <div
                    className="video-wrapper"
                    data-playback-error={playbackError || undefined}
                  >
                    {item.episode_current === "Trailer" ? (
                      <iframe
                        src={videoSource}
                        title="video-player"
                        frameBorder="0"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <CustomVideoPlayer
                        videoRef={videoRef}
                        title={item.title || item.name}
                        episodeName={currentEp?.name}
                        episodeGroupTitle={currentEp?.episodeGroupTitle}
                      />
                    )}
                  </div>
                  {playbackError && (
                    <p className="playback-error" role="alert">
                      {playbackError}
                    </p>
                  )}
                </div>

                {item.episode_current !== "Trailer" &&
                  episodeList.length > 0 && (
                    <>
                      {/* Auto-play Toggle */}
                      <div className="autoplay-toggle-container">
                        <label className="autoplay-toggle">
                          <input
                            type="checkbox"
                            checked={autoPlayEnabled}
                            onChange={handleToggleAutoPlay}
                          />
                          <span className="toggle-slider"></span>
                          <span className="toggle-label">
                            <i className="bx bx-play-circle"></i>
                            Tự động phát tập tiếp theo
                          </span>
                        </label>
                      </div>

                      {/* Next/Prev Episode Navigation */}
                      <div className="episode-navigation">
                        <button
                          className="episode-nav-btn prev"
                          onClick={handlePrevEpisode}
                          disabled={currentEpisodeIndex <= 0}
                        >
                          <i className="bx bx-chevron-left"></i>
                          <span>Tập trước</span>
                        </button>

                        <div className="current-episode-info">
                          <span className="episode-label">Đang xem:</span>
                          <span className="episode-number">
                            {currentEpisodeDisplayName}
                          </span>
                        </div>

                        <button
                          className="episode-nav-btn next"
                          onClick={handleNextEpisode}
                          disabled={
                            currentEpisodeIndex === -1 ||
                            currentEpisodeIndex >= episodeList.length - 1
                          }
                        >
                          <span>Tập tiếp</span>
                          <i className="bx bx-chevron-right"></i>
                        </button>
                      </div>

                      {/* Auto-play Notice */}
                      {showAutoPlayNotice && autoPlayCountdown !== null && (
                        <div className="autoplay-notice">
                          <div className="autoplay-content">
                            <i className="bx bx-play-circle"></i>
                            <div className="autoplay-text">
                              <p className="autoplay-title">
                                Tự động phát tập tiếp theo
                              </p>
                              <p className="autoplay-countdown">
                                {formatEpisodeDisplayName(
                                  episodeList[currentEpisodeIndex + 1]?.name,
                                )}{" "}
                                sẽ phát sau {autoPlayCountdown} giây
                              </p>
                            </div>
                            <button
                              className="autoplay-cancel"
                              onClick={handleCancelAutoPlay}
                            >
                              <i className="bx bx-x"></i>
                              Hủy
                            </button>
                          </div>
                          <div className="autoplay-progress">
                            <div
                              className="autoplay-progress-bar"
                              style={{
                                width: `${((10 - autoPlayCountdown) / 10) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Continue Watching Notice */}
                      {showContinueWatching && savedProgress && (
                        <div className="continue-watching-notice">
                          <div className="continue-watching-content">
                            <i className="bx bx-time-five"></i>
                            <div className="continue-watching-text">
                              <p className="continue-watching-title">
                                Tiếp tục xem từ{" "}
                                {formatTime(savedProgress.currentTime)}?
                              </p>
                              <p className="continue-watching-info">
                                Bạn đã xem đến{" "}
                                {Math.round(savedProgress.percentage)}% của tập
                                này
                              </p>
                            </div>
                            <div className="continue-watching-actions">
                              <button
                                className="continue-btn"
                                onClick={handleContinueWatching}
                              >
                                <i className="bx bx-play"></i>
                                Tiếp tục
                              </button>
                              <button
                                className="restart-btn"
                                onClick={handleStartFromBeginning}
                              >
                                <i className="bx bx-revision"></i>
                                Xem lại từ đầu
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      <EpisodeScroll
                        episodes={episodeList}
                        episodeGroups={episodeGroups}
                        currentEpisode={currentEp}
                        onSelectEpisode={handleSelectEpisode}
                      />
                    </>
                  )}
              </div>
            </div>

            {showSecondaryContent && (
              <div className="section mb-3">
                <div className="section__header mb-2">
                  <h2>Tương tự</h2>
                </div>
                <SimilarMovies movie={item} />
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default Detail;
