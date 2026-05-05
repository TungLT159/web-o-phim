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

import React, { useEffect, useState, useRef } from "react";
import { useParams, useHistory, useLocation } from "react-router"; // ✅ thêm useHistory, useLocation
import tmdbApi from "../../api/tmdbApi";
import apiConfig from "../../api/apiConfig";
import axiosClient from "../../api/axiosClient";
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

  const iframeRef = useRef(null);
  const autoPlayTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

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
      }
      window.scrollTo(0, 0);
    };
    getDetail();
  }, [category, id, epFromUrl]);

  useEffect(() => {
    const fetchImage = async () => {
      if (!id || !item?.tmdb) return;
      try {
        // const apiKey = process.env.REACT_APP_TMDB_API_KEY;
        const apiKey = "2724d844032ce6b2526dad06a0936a6e";

        const response = await axiosClient.get(
          `https://api.themoviedb.org/3/${item.tmdb.type}/${item.tmdb.id}?api_key=${apiKey}&language=vi-VN`,
        );
        if (response.poster_path) {
          setPosterUrl(apiConfig.w500Image(response.poster_path));
          setBackdropUrl(apiConfig.w500Image(response.backdrop_path));
          setOverview(response.overview);
        } else {
          setPosterUrl("/poster-mau.png");
        }
      } catch (error) {
        setPosterUrl("/poster-mau.png");
        console.error("Lỗi khi load movie detail:", error);
      }
    };
    fetchImage();
  }, [id, item?.tmdb]);

  // ✅ Khi chọn tập → cập nhật state và URL
  const handleSelectEpisode = (ep) => {
    setCurrentEp(ep);

    // Clear auto-play timers
    clearAutoPlayTimers();

    // cập nhật URL param
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("ep", ep.name);
    history.replace({
      pathname: location.pathname,
      search: searchParams.toString(),
    });

    // Cuộn về video
    if (iframeRef.current) {
      iframeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  // ✅ Get current episode index
  const getCurrentEpisodeIndex = () => {
    if (!item?.episodes?.[0]?.server_data || !currentEp) return -1;
    return item.episodes[0].server_data.findIndex(
      (ep) => ep.name === currentEp.name
    );
  };

  // ✅ Navigate to previous episode
  const handlePrevEpisode = () => {
    const currentIndex = getCurrentEpisodeIndex();
    if (currentIndex > 0) {
      const prevEp = item.episodes[0].server_data[currentIndex - 1];
      handleSelectEpisode(prevEp);
    }
  };

  // ✅ Navigate to next episode
  const handleNextEpisode = () => {
    const currentIndex = getCurrentEpisodeIndex();
    if (
      currentIndex !== -1 &&
      currentIndex < item.episodes[0].server_data.length - 1
    ) {
      const nextEp = item.episodes[0].server_data[currentIndex + 1];
      handleSelectEpisode(nextEp);
    }
  };

  // ✅ Clear auto-play timers
  const clearAutoPlayTimers = () => {
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
  };

  // ✅ Cancel auto-play
  const handleCancelAutoPlay = () => {
    clearAutoPlayTimers();
  };

  // ✅ Auto-play next episode after video ends (simulated with timer)
  useEffect(() => {
    // Clear previous timers
    clearAutoPlayTimers();

    // Only auto-play if there's a next episode
    const currentIndex = getCurrentEpisodeIndex();
    if (
      currentIndex !== -1 &&
      currentIndex < item?.episodes?.[0]?.server_data?.length - 1
    ) {
      // Show countdown after 5 seconds (simulating video end)
      // In production, you'd detect actual video end event
      autoPlayTimerRef.current = setTimeout(() => {
        setShowAutoPlayNotice(true);
        setAutoPlayCountdown(10);

        // Countdown interval
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
      }, 5000); // Show notice after 5 seconds
    }

    return () => {
      clearAutoPlayTimers();
    };
  }, [currentEp, item]);

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
              content={overview || "Xem phim online chất lượng HD"}
            />
            <link rel="icon" href="/logo.png" />
            <meta
              property="og:title"
              content={`${item.title || item.name} ${
                currentEp ? `- Tập ${currentEp.name}` : ""
              }`}
            />
            <meta property="og:description" content={overview} />
            <meta property="og:image" content={item.poster_url} />
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
                {item.category &&
                  item.category.slice(0, 5).map((genre, i) => (
                    <span key={i} className="genres__item">
                      {genre.name}
                    </span>
                  ))}
              </div>
              {/* ✅ Thêm các tag thông tin */}
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
                {item.year && (
                  <span className="tag">Số tập: {item.episode_total}</span>
                )}
                {item.year && (
                  <span className="tag">
                    Tình trạng: {item.episode_current}
                  </span>
                )}
                {item.year && <span className="tag">Năm: {item.year}</span>}
              </div>

              {/* genres, tags, mô tả giữ nguyên */}
              <p className="overview">
                {overview ? overview : item.content?.replace(/<[^>]+>/g, "")}
              </p>
            </div>
          </div>

          <div className="container">
            <div className="section mb-3">
              <div className="watch-section">
                <div className="video-player" ref={iframeRef}>
                  <div className="video-wrapper">
                    <iframe
                      src={
                        item.episode_current === "Trailer"
                          ? item.trailer_url?.replace("watch?v=", "embed/")
                          : currentEp?.link_embed
                      }
                      title="video-player"
                      frameBorder="0"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>

                {item.episode_current !== "Trailer" && item.episodes && (
                  <>
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
                              Tập {item.episodes[0].server_data[getCurrentEpisodeIndex() + 1]?.name} sẽ phát sau {autoPlayCountdown} giây
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
