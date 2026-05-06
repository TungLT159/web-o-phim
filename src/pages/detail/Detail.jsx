// import React, { useEffect, useState, useRef } from "react";
// import { useParams } from "react-router";

// import tmdbApi from "../../api/tmdbApi";
// import apiConfig from "../../api/apiConfig";
// import axiosClient from "../../api/axiosClient";
// import "./detail.scss";
// // import CastList from "./CastList";
// import { Helmet } from "react-helmet";

// import MovieList from "../../components/movie-list/MovieList";

// const Detail = () => {
//   const { category, id } = useParams();
//   const [item, setItem] = useState(null);
//   const [poster_url, setPosterUrl] = useState("/poster-mau.png");
//   // const [poster_url, setPosterUrl] = useState("");
//   const [backdrop_url, setBackdropUrl] = useState("");
//   const [overview, setOverview] = useState("");

//   const [currentEp, setCurrentEp] = useState(null); // ✅ tập đang xem
//   const iframeRef = useRef(null);

//   useEffect(() => {
//     const getDetail = async () => {
//       const response = await tmdbApi.detail(category, id, { params: {} });
//       const data = response.data.item;
//       // console.log(response);
//       setItem(data);

//       // ✅ Nếu không phải Trailer thì set mặc định tập đầu
//       if (
//         data.episode_current !== "Trailer" &&
//         data.episodes?.[0]?.server_data
//       ) {
//         setCurrentEp(data.episodes[0].server_data[0]);
//       }
//       window.scrollTo(0, 0);
//     };
//     getDetail();
//   }, [category, id]);

//   useEffect(() => {
//     const fetchImage = async () => {
//       if (!id || !item?.tmdb) return;

//       try {
//         const response = await axiosClient.get(
//           `https://api.themoviedb.org/3/${item.tmdb.type}/${item.tmdb.id}?api_key=2724d844032ce6b2526dad06a0936a6e&language=vi-VN`
//         );
//         console.log(response);

//         // axiosClient đã unwrap -> response chính là data
//         if (response.poster_path) {
//           setPosterUrl(apiConfig.w500Image(response.poster_path));
//           setBackdropUrl(apiConfig.w500Image(response.backdrop_path));
//           setOverview(response.overview);
//         } else {
//           setPosterUrl("/poster-mau.png");
//         }
//       } catch (error) {
//         setPosterUrl("/poster-mau.png");
//         console.error("Lỗi khi load movie detail:", error);
//       }
//     };
//     fetchImage();
//   }, [id, item?.tmdb]);

//   // useEffect(() => {
//   //   const fetchImage = async () => {
//   //     if (!id) return;
//   //     try {
//   //       const response = await axiosClient.get(
//   //         `https://ophim1.com/v1/api/phim/${id}/images`
//   //       );
//   //       setPosterUrl(
//   //         `${response.data.image_sizes.poster.original}${
//   //           response.data.images[response.data.images.length - 2].file_path
//   //         }`
//   //       );
//   //       // console.log(response);
//   //       // console.log(
//   //       //   response.data.image_sizes.poster.original +
//   //       //     response.data.images[response.data.images.length - 2].file_path
//   //       // );
//   //     } catch (error) {
//   //       setPosterUrl("/poster-mau.png");
//   //       // setPosterUrl("/noposter.jpg");
//   //       console.error("Lỗi khi load movie detail:", error);
//   //     }
//   //   };
//   //   fetchImage();
//   // }, [id]);

//   const handleSelectEpisode = (ep) => {
//     setCurrentEp(ep);

//     // ✅ Cuộn màn hình về video
//     if (iframeRef.current) {
//       iframeRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
//     }
//   };

//   return (
//     <>
//       {item && (
//         <>
//           {item && (
//             <>
//               <Helmet>
//                 <title>{`${item.title || item.name} | Ổ Phim`}</title>
//                 <meta
//                   name="description"
//                   content={item.overview || "Xem phim online chất lượng HD"}
//                 />
//                 <link rel="icon" href="/logo.png" />
//                 <meta property="og:title" content={item.title || item.name} />
//                 <meta property="og:description" content={overview} />
//                 <meta property="og:image" content={item.poster_url} />
//               </Helmet>
//             </>
//           )}
//           <div
//             className="banner"
//             style={{
//               backgroundImage: `url(${backdrop_url})`,
//             }}
//           ></div>
//           <div className="mb-3 movie-content container">
//             <div className="movie-content__poster">
//               <div
//                 className="movie-content__poster__img"
//                 style={{
//                   backgroundImage: `url(${poster_url})`,
//                 }}
//               ></div>
//             </div>
//             <div className="movie-content__info">
//               <h1 className="title">{item.title || item.name}</h1>
//               <div className="genres">
//                 {item.category &&
//                   item.category.slice(0, 5).map((genre, i) => (
//                     <span key={i} className="genres__item">
//                       {genre.name}
//                     </span>
//                   ))}
//               </div>

//               {/* ✅ Thêm các tag thông tin */}
//               <div className="movie-tags">
//                 {item.quality && (
//                   <span className="tag">Chất lượng: {item.quality}</span>
//                 )}
//                 {item.lang && (
//                   <span className="tag">Ngôn ngữ: {item.lang}</span>
//                 )}
//                 {item.time && (
//                   <span className="tag">Thời lượng: {item.time}</span>
//                 )}
//                 {item.year && <span className="tag">Năm: {item.year}</span>}
//               </div>

//               <p className="overview">{item.overview}</p>

//               {/* <div className="cast">
//                 <div className="section__header">
//                   <h2>Casts</h2>
//                 </div>
//                 <CastList id={item.slug} />
//               </div> */}

//               {item.content && (
//                 <div className="movie-description">
//                   <div className="section__header">
//                     <h2>Mô tả</h2>
//                   </div>
//                   <p>{overview.replace(/<[^>]+>/g, "")}</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="container">
//             <div className="section mb-3">
//               <div className="watch-section">
//                 <div className="video-player" ref={iframeRef}>
//                   <div className="video-wrapper">
//                     <iframe
//                       src={
//                         item.episode_current === "Trailer"
//                           ? item.trailer_url?.replace("watch?v=", "embed/")
//                           : currentEp?.link_embed
//                       }
//                       title="video-player"
//                       frameBorder="0"
//                       allowFullScreen
//                     ></iframe>
//                   </div>
//                 </div>

//                 {item.episode_current !== "Trailer" && item.episodes && (
//                   <div
//                     className={`episode-list ${
//                       item.episodes[0].server_data.length > 10 ? "many" : ""
//                     }`}
//                   >
//                     {item.episodes[0].server_data.map((ep, index) => (
//                       <button
//                         key={index}
//                         className={`episode-btn ${
//                           currentEp?.name === ep.name ? "active" : ""
//                         }`}
//                         onClick={() => handleSelectEpisode(ep)}
//                       >
//                         Tập {ep.name}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="section mb-3">
//               <div className="section__header mb-2">
//                 <h2>Tương tự</h2>
//               </div>
//               <MovieList
//                 category={item.category[0].slug}
//                 type="similar"
//                 id={item.id}
//               />
//             </div>
//           </div>
//         </>
//       )}
//     </>
//   );
// };

// export default Detail;

import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useHistory, useLocation } from "react-router";
import Hls from "hls.js";
import tmdbApi from "../../api/tmdbApi";
import axiosClient from "../../api/axiosClient";
import { fetchTMDBImages } from "../../utils/tmdbImageFetcher";
import { 
  saveWatchProgress, 
  getWatchProgress, 
  shouldShowContinueWatching,
  formatTime 
} from "../../utils/watchHistoryManager";
import "./detail.scss";
import { Helmet } from "react-helmet";
import MovieList from "../../components/movie-list/MovieList";
import EpisodeScroll from "../../components/episode-scroll/EpisodeScroll";

const Detail = () => {
  const { category, id } = useParams();
  const history = useHistory();
  const location = useLocation();

  const [item, setItem] = useState(null);
  const [poster_url, setPosterUrl] = useState("/poster-mau.png");
  const [backdrop_url, setBackdropUrl] = useState("");
  const [overview, setOverview] = useState("");
  const [currentEp, setCurrentEp] = useState(null);
  const [autoPlayCountdown, setAutoPlayCountdown] = useState(null);
  const [showAutoPlayNotice, setShowAutoPlayNotice] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(() => {
    // Lấy từ localStorage, mặc định là true
    const saved = localStorage.getItem('autoPlayEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  // Watch history states
  const [showContinueWatching, setShowContinueWatching] = useState(false);
  const [savedProgress, setSavedProgress] = useState(null);
  const saveProgressIntervalRef = useRef(null);

  const videoRef = useRef(null);
  const autoPlayTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const hlsRef = useRef(null);

  // ✅ Toggle auto-play setting
  const handleToggleAutoPlay = useCallback(() => {
    const newValue = !autoPlayEnabled;
    setAutoPlayEnabled(newValue);
    localStorage.setItem('autoPlayEnabled', JSON.stringify(newValue));
    
    // Nếu tắt auto-play, clear timers hiện tại
    if (!newValue) {
      clearAutoPlayTimers();
    }
  }, [autoPlayEnabled]);

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

  // ✅ Get current episode index
  const getCurrentEpisodeIndex = useCallback(() => {
    if (!item?.episodes?.[0]?.server_data || !currentEp) return -1;
    return item.episodes[0].server_data.findIndex(
      (ep) => ep.name === currentEp.name
    );
  }, [item, currentEp]);

  // ✅ Memoize genres list
  const genresList = useMemo(() => {
    if (!item?.category) return null;
    return item.category.slice(0, 5).map((genre, i) => (
      <span key={i} className="genres__item">
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
        {item.lang && (
          <span className="tag">Ngôn ngữ: {item.lang}</span>
        )}
        {item.time && (
          <span className="tag">Thời lượng: {item.time}</span>
        )}
        {item.episode_total && (
          <span className="tag">Số tập: {item.episode_total}</span>
        )}
        {item.episode_current && (
          <span className="tag">Tình trạng: {item.episode_current}</span>
        )}
        {item.year && <span className="tag">Năm: {item.year}</span>}
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

  // ✅ Lấy episode từ URL param nếu có
  const query = new URLSearchParams(location.search);
  const epFromUrl = query.get("ep");

  useEffect(() => {
    const getDetail = async () => {
      const response = await tmdbApi.detail(category, id, { params: {} });
      const data = response.data.item;
      setItem(data);

      // Nếu không phải Trailer → set tập từ URL hoặc tập đầu
      if (
        data.episode_current !== "Trailer" &&
        data.episodes?.[0]?.server_data
      ) {
        let defaultEp = data.episodes[0].server_data[0];
        if (epFromUrl) {
          const found = data.episodes[0].server_data.find(
            (e) => e.name === epFromUrl,
          );
          if (found) defaultEp = found;
        }
        setCurrentEp(defaultEp);
        
        // Kiểm tra xem có watch progress không
        const progress = getWatchProgress(id, defaultEp.name);
        if (progress && shouldShowContinueWatching(progress.currentTime, progress.duration)) {
          setSavedProgress(progress);
          setShowContinueWatching(true);
        }
      }
      window.scrollTo(0, 0);
    };
    getDetail();
  }, [category, id, epFromUrl]);

  useEffect(() => {
    const loadImages = async () => {
      if (!id || !item?.tmdb) return;
      const { posterUrl, backdropUrl, overview: tmdbOverview } = await fetchTMDBImages(item.tmdb);
      setPosterUrl(posterUrl);
      setBackdropUrl(backdropUrl);
      setOverview(tmdbOverview);
    };
    loadImages();
  }, [id, item?.tmdb]);

  // ✅ Khi chọn tập → cập nhật state và URL
  const handleSelectEpisode = useCallback((ep) => {
    setCurrentEp(ep);

    // Clear auto-play timers
    clearAutoPlayTimers();
    
    // Ẩn continue watching notification khi chọn tập mới
    setShowContinueWatching(false);
    setSavedProgress(null);

    // cập nhật URL param
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("ep", ep.name);
    history.replace({
      pathname: location.pathname,
      search: searchParams.toString(),
    });

    // Cuộn về video
    if (videoRef.current) {
      videoRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
    
    // Kiểm tra watch progress cho tập mới
    const progress = getWatchProgress(id, ep.name);
    if (progress && shouldShowContinueWatching(progress.currentTime, progress.duration)) {
      setSavedProgress(progress);
      setShowContinueWatching(true);
    }
  }, [location.search, location.pathname, history, clearAutoPlayTimers, id]);

  // ✅ Navigate to previous episode
  const handlePrevEpisode = useCallback(() => {
    const currentIndex = getCurrentEpisodeIndex();
    if (currentIndex > 0) {
      const prevEp = item.episodes[0].server_data[currentIndex - 1];
      handleSelectEpisode(prevEp);
    }
  }, [getCurrentEpisodeIndex, item, handleSelectEpisode]);

  // ✅ Navigate to next episode
  const handleNextEpisode = useCallback(() => {
    const currentIndex = getCurrentEpisodeIndex();
    if (
      currentIndex !== -1 &&
      currentIndex < item.episodes[0].server_data.length - 1
    ) {
      const nextEp = item.episodes[0].server_data[currentIndex + 1];
      handleSelectEpisode(nextEp);
    }
  }, [getCurrentEpisodeIndex, item, handleSelectEpisode]);

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

  // ✅ Initialize HLS player for m3u8 videos
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentEp?.link_m3u8) return;

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(currentEp.link_m3u8);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch((err) => console.log("Auto-play prevented:", err));
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error("HLS Error:", data);
          // Fallback to link_embed if available
          if (currentEp.link_embed) {
            video.src = currentEp.link_embed;
          }
        }
      });

      hlsRef.current = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS support (Safari)
      video.src = currentEp.link_m3u8;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch((err) => console.log("Auto-play prevented:", err));
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentEp]);

  // ✅ Auto-play next episode when video is near end
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hasTriggeredAutoPlay = false;

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      const duration = video.duration;
      
      // Lưu watch progress mỗi 5 giây
      if (currentTime > 0 && duration > 0) {
        if (!saveProgressIntervalRef.current) {
          saveProgressIntervalRef.current = setInterval(() => {
            const video = videoRef.current;
            if (video && currentEp && item) {
              saveWatchProgress(
                id,
                currentEp.name,
                video.currentTime,
                video.duration,
                {
                  title: item.title || item.name,
                  poster: poster_url,
                  slug: item.slug
                }
              );
            }
          }, 5000);
        }
      }

      // Kiểm tra nếu video còn 30 giây cuối và chưa trigger
      if (duration - currentTime <= 30 && !hasTriggeredAutoPlay && autoPlayEnabled) {
        const currentIndex = getCurrentEpisodeIndex();
        if (
          currentIndex !== -1 &&
          currentIndex < item?.episodes?.[0]?.server_data?.length - 1
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
      const currentIndex = getCurrentEpisodeIndex();
      if (
        autoPlayEnabled &&
        currentIndex !== -1 &&
        currentIndex < item?.episodes?.[0]?.server_data?.length - 1
      ) {
        // Tự động phát tập tiếp theo ngay lập tức khi video kết thúc
        handleNextEpisode();
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleVideoEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleVideoEnded);
      clearAutoPlayTimers();
      
      // Clear save progress interval
      if (saveProgressIntervalRef.current) {
        clearInterval(saveProgressIntervalRef.current);
        saveProgressIntervalRef.current = null;
      }
    };
  }, [currentEp, item, autoPlayEnabled, id, poster_url]);

  // ✅ Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ignore if user is typing in an input
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          handlePrevEpisode();
          break;
        case "ArrowRight":
          e.preventDefault();
          handleNextEpisode();
          break;
        case "Escape":
          if (showAutoPlayNotice) {
            e.preventDefault();
            handleCancelAutoPlay();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentEp, item, showAutoPlayNotice]);

  // Get absolute image URL for social sharing
  const getAbsoluteImageUrl = useCallback((imageUrl) => {
    if (!imageUrl) return `${window.location.origin}/poster-mau.png`;
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${window.location.origin}${imageUrl}`;
  }, []);

  // Generate structured data for SEO
  const structuredData = useMemo(() => {
    if (!item) return null;
    
    return {
      "@context": "https://schema.org",
      "@type": "Movie",
      "name": item.title || item.name,
      "description": overview || item.content?.replace(/<[^>]+>/g, ""),
      "image": getAbsoluteImageUrl(poster_url),
      "datePublished": item.year,
      "genre": item.category?.map(cat => cat.name).join(", "),
      "contentRating": item.quality,
      "inLanguage": item.lang || "vi",
      "duration": item.time,
      "aggregateRating": item.tmdb?.vote_average ? {
        "@type": "AggregateRating",
        "ratingValue": item.tmdb.vote_average,
        "ratingCount": item.tmdb.vote_count
      } : undefined
    };
  }, [item, overview, poster_url, getAbsoluteImageUrl]);

  return (
    <>
      {item && (
        <>
          <Helmet>
            <title>
              {`${item.title || item.name} ${
                currentEp ? `- Tập ${currentEp.name}` : ""
              } | Ổ Phim`}
            </title>
            <meta
              name="description"
              content={overview || item.content?.replace(/<[^>]+>/g, "") || "Xem phim online chất lượng HD"}
            />
            <meta name="keywords" content={`${item.title || item.name}, xem phim ${item.title || item.name}, ${item.category?.map(c => c.name).join(", ")}, phim ${item.year}`} />
            <link rel="icon" href="/logo.png" />
            <link rel="canonical" href={`${window.location.origin}/movie/${id}${currentEp ? `?ep=${currentEp.name}` : ''}`} />
            
            {/* Open Graph */}
            <meta property="og:type" content="video.movie" />
            <meta property="og:title" content={`${item.title || item.name} ${currentEp ? `- Tập ${currentEp.name}` : ""}`} />
            <meta property="og:description" content={overview || item.content?.replace(/<[^>]+>/g, "") || "Xem phim online chất lượng HD"} />
            <meta property="og:image" content={getAbsoluteImageUrl(poster_url)} />
            <meta property="og:image:secure_url" content={getAbsoluteImageUrl(poster_url)} />
            <meta property="og:image:width" content="500" />
            <meta property="og:image:height" content="750" />
            <meta property="og:image:alt" content={`Poster phim ${item.title || item.name}`} />
            <meta property="og:image:type" content="image/jpeg" />
            <meta property="og:url" content={`${window.location.origin}/movie/${id}`} />
            <meta property="og:site_name" content="Ổ Phim" />
            <meta property="og:locale" content="vi_VN" />
            
            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={`${item.title || item.name} ${currentEp ? `- Tập ${currentEp.name}` : ""}`} />
            <meta name="twitter:description" content={overview || item.content?.replace(/<[^>]+>/g, "") || "Xem phim online chất lượng HD"} />
            <meta name="twitter:image" content={getAbsoluteImageUrl(poster_url)} />
            <meta name="twitter:image:alt" content={`Poster phim ${item.title || item.name}`} />
            
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
                {currentEp ? `- Tập ${currentEp.name}` : ""}
              </h1>
              <div className="genres">
                {genresList}
              </div>
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
                  <div className="video-wrapper">
                    {item.episode_current === "Trailer" ? (
                      <iframe
                        src={videoSource}
                        title="video-player"
                        frameBorder="0"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <video
                        ref={videoRef}
                        controls
                        autoPlay
                        controlsList="nodownload"
                        style={{ width: "100%", height: "100%" }}
                      >
                        Trình duyệt của bạn không hỗ trợ video HTML5.
                      </video>
                    )}
                  </div>
                </div>

                {item.episode_current !== "Trailer" && item.episodes && (
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
                        disabled={getCurrentEpisodeIndex() <= 0}
                      >
                        <i className="bx bx-chevron-left"></i>
                        <span>Tập trước</span>
                      </button>

                      <div className="current-episode-info">
                        <span className="episode-label">Đang xem:</span>
                        <span className="episode-number">
                          Tập {currentEp?.name}
                        </span>
                      </div>

                      <button
                        className="episode-nav-btn next"
                        onClick={handleNextEpisode}
                        disabled={
                          getCurrentEpisodeIndex() === -1 ||
                          getCurrentEpisodeIndex() >=
                            item.episodes[0].server_data.length - 1
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
                              Tập{" "}
                              {
                                item.episodes[0].server_data[
                                  getCurrentEpisodeIndex() + 1
                                ]?.name
                              }{" "}
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
                              Tiếp tục xem từ {formatTime(savedProgress.currentTime)}?
                            </p>
                            <p className="continue-watching-info">
                              Bạn đã xem đến {Math.round(savedProgress.percentage)}% của tập này
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
                      episodes={item.episodes[0].server_data}
                      currentEpisode={currentEp}
                      onSelectEpisode={handleSelectEpisode}
                    />
                  </>
                )}
              </div>
            </div>

            <div className="section mb-3">
              <div className="section__header mb-2">
                <h2>Tương tự</h2>
              </div>
              <MovieList
                category={item.category[0].slug}
                type="similar"
                id={item.id}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Detail;
