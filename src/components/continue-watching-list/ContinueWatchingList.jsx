import React from "react";
import { Link } from "react-router-dom";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { formatEpisodeDisplayName } from "../../utils/episodeDisplayName";
import { getRecentInProgressMovies } from "../../utils/watchHistoryManager";
import "./continue-watching-list.scss";

const FALLBACK_POSTER = "/poster-mau.png";

const getEpisodeDisplayText = (episodeName) => {
  const displayName = `${episodeName || ""}`
    .split(":")
    .pop()
    .replace(/^tap-/i, "");
  return displayName ? formatEpisodeDisplayName(displayName) : "";
};

const ContinueWatchingList = () => {
  const items = getRecentInProgressMovies(10);

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      className="section mb-3 continue-watching-list"
      aria-labelledby="continue-watching-heading"
    >
      <div className="section__header mb-2">
        <h2
          id="continue-watching-heading"
          className="continue-watching-list__heading"
        >
          Tiếp tục xem
        </h2>
      </div>

      <div className="continue-watching-list__carousel-wrapper">
        <Swiper
          modules={[Navigation, Autoplay]}
          className="continue-watching-list__carousel"
          data-testid="continue-watching-carousel"
          grabCursor={true}
          spaceBetween={12}
          slidesPerView="auto"
          autoplay={{ delay: 4000 }}
          navigation={{
            nextEl: ".continue-watching-list__button-next",
            prevEl: ".continue-watching-list__button-prev",
          }}
        >
          {items.map((item) => {
            const movieInfo = item.movieInfo || {};
            const slug = movieInfo.slug || item.movieId;
            const title = movieInfo.title || item.movieId;
            const poster = movieInfo.poster || FALLBACK_POSTER;
            const percentage = Math.round(item.percentage || 0);
            const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
            const resumeUrl = `/movie/${slug}?ep=${encodeURIComponent(item.episodeName || "")}`;
            const episodeDisplayText = getEpisodeDisplayText(item.episodeName);

            return (
              <SwiperSlide key={`${item.movieId}-${item.episodeName}`}>
                <Link className="continue-watching-list__card" to={resumeUrl}>
                  <div className="continue-watching-list__poster">
                    <img src={poster} alt="" loading="lazy" />
                    <div className="continue-watching-list__progress-bar">
                      <span style={{ width: `${clampedPercentage}%` }} />
                    </div>
                  </div>
                  <div className="continue-watching-list__meta">
                    <h3 className="continue-watching-list__title">{title}</h3>
                    {episodeDisplayText ? (
                      <p className="continue-watching-list__episode-text">
                        Tập đang xem: {episodeDisplayText}
                      </p>
                    ) : null}
                    <p className="continue-watching-list__progress-text">
                      Đã xem {percentage}%
                    </p>
                  </div>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
        <div className="continue-watching-list__button-prev swiper-button-prev">
          <i className="bx bx-chevron-left"></i>
        </div>
        <div className="continue-watching-list__button-next swiper-button-next">
          <i className="bx bx-chevron-right"></i>
        </div>
      </div>
    </section>
  );
};

export default ContinueWatchingList;
