import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation, Pagination, Autoplay } from "swiper";
import "swiper/swiper.min.css";
import "./ranking-section.scss";
import { fetchTMDBImages } from "../../utils/tmdbImageFetcher";

// Install Swiper modules
SwiperCore.use([Navigation, Pagination, Autoplay]);

const RankingSection = ({ title, movies, icon, type }) => {
  const [moviesWithImages, setMoviesWithImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMoviesData = async () => {
      if (!movies || movies.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const moviesData = await Promise.all(
          movies.slice(0, 10).map(async (movie, index) => {
            let posterUrl = "/poster-mau.png";
            let rating = null;

            if (movie.tmdb?.id) {
              try {
                const { posterUrl: tmdbPoster } = await fetchTMDBImages(
                  movie.tmdb,
                );
                posterUrl = tmdbPoster;
                rating = movie.tmdb.vote_average;
              } catch (error) {
                console.error("Error fetching TMDB data:", error);
              }
            }

            return {
              ...movie,
              posterUrl,
              rating,
              rank: index + 1,
            };
          }),
        );

        setMoviesWithImages(moviesData);
      } catch (error) {
        console.error("Error loading movies data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMoviesData();
  }, [movies]);

  const getRankClass = (rank) => {
    if (rank === 1) return "rank-gold";
    if (rank === 2) return "rank-silver";
    if (rank === 3) return "rank-bronze";
    return "";
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  if (loading) {
    return (
      <div className="ranking-section">
        <div className="ranking-section__header">
          <h2>
            <i className={icon}></i>
            {title}
          </h2>
        </div>
        <div className="ranking-section__loading">
          <div className="spinner"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ranking-section">
      <div className="ranking-section__header">
        <div className="header-left">
          <h2>
            <i className={icon}></i>
            {title}
          </h2>
          <span className="ranking-type">{type}</span>
        </div>
      </div>

      <div className="ranking-slider-wrapper">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          navigation={{
            nextEl: `.swiper-button-next-${title.replace(/\s+/g, "-")}`,
            prevEl: `.swiper-button-prev-${title.replace(/\s+/g, "-")}`,
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 15,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 20,
            },
            1280: {
              slidesPerView: 5,
              spaceBetween: 20,
            },
          }}
          className="ranking-slider"
        >
          {moviesWithImages.map((movie) => (
            <SwiperSlide key={movie.slug}>
              <Link to={`/movie/${movie.slug}`} className="ranking-card">
                <div
                  className={`ranking-card__rank ${getRankClass(movie.rank)}`}
                >
                  <span className="rank-number">{getRankIcon(movie.rank)}</span>
                </div>

                <div className="ranking-card__poster">
                  <img src={movie.posterUrl} alt={movie.title || movie.name} />

                  <div className="ranking-card__overlay">
                    <div className="play-button">
                      <i className="bx bx-play"></i>
                    </div>
                  </div>

                  {movie.quality && (
                    <span className="quality-badge">{movie.quality}</span>
                  )}
                </div>

                <div className="ranking-card__info">
                  <h3 className="ranking-card__title">
                    {movie.title || movie.name}
                  </h3>

                  <div className="ranking-card__meta">
                    {movie.year && (
                      <span className="meta-item">
                        <i className="bx bx-calendar"></i>
                        {movie.year}
                      </span>
                    )}

                    {movie.rating && (
                      <span className="meta-item rating">
                        <i className="bx bxs-star"></i>
                        {movie.rating.toFixed(1)}
                      </span>
                    )}
                  </div>

                  {movie.view && (
                    <div className="ranking-card__views">
                      <i className="bx bx-show"></i>
                      <span>{movie.view.toLocaleString()} lượt xem</span>
                    </div>
                  )}
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation Buttons */}
        <div
          className={`swiper-button-prev swiper-button-prev-${title.replace(/\s+/g, "-")}`}
        >
          <i className="bx bx-chevron-left"></i>
        </div>
        <div
          className={`swiper-button-next swiper-button-next-${title.replace(/\s+/g, "-")}`}
        >
          <i className="bx bx-chevron-right"></i>
        </div>
      </div>
    </div>
  );
};

export default RankingSection;
