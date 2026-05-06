import React, { useState, useEffect, useRef } from "react";

import SwiperCore, { Autoplay } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";

import Button, { OutlineButton } from "../button/Button";
import Modal, { ModalContent } from "../modal/Modal";

import tmdbApi, { movieType } from "../../api/tmdbApi";
import axiosClient from "../../api/axiosClient";
import { fetchTMDBImages } from "../../utils/tmdbImageFetcher";
import "./hero-slide.scss";
import { useHistory } from "react-router";

const HeroSlide = () => {
  SwiperCore.use([Autoplay]);

  const [movieItems, setMovieItems] = useState([]);

  useEffect(() => {
    const getMovies = async () => {
      const params = { page: 1 };
      try {
        const response = await tmdbApi.getMoviesList(movieType.phimChieuRap, {
          params,
        });
        setMovieItems(response.data.items.slice(0, 10));
        // console.log(response);
      } catch {
        console.log("error");
      }
    };
    getMovies();
  }, []);

  return (
    <div className="hero-slide">
      <Swiper
        modules={[Autoplay]}
        grabCursor={true}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{ delay: 8000 }}
      >
        {movieItems.map((item, i) => (
          <SwiperSlide key={i}>
            {({ isActive }) => (
              <HeroSlideItem
                item={item}
                className={`${isActive ? "active" : ""}`}
              />
            )}
          </SwiperSlide>
        ))}
      </Swiper>
      {movieItems.map((item, i) => (
        <TrailerModal key={i} item={item} />
      ))}
    </div>
  );
};

const HeroSlideItem = (props) => {
  let history = useHistory();
  const item = props.item;
  const [movie, setMovie] = useState(null);
  const [poster_url, setPosterUrl] = useState("/poster-mau.png");
  const [backdrop_url, setBackdropUrl] = useState("");
  const [overview, setOverview] = useState("");

  // Fetch movie detail từ Ophim API
  useEffect(() => {
    const fetchMovieDetail = async () => {
      if (!item.slug) return;
      try {
        const response = await axiosClient.get(
          `https://ophim1.com/v1/api/phim/${item.slug}`,
        );
        setMovie(response.data);
      } catch (error) {
        console.error("Lỗi khi load movie detail:", error);
      }
    };
    fetchMovieDetail();
  }, [item.slug]);

  // Fetch TMDB images
  useEffect(() => {
    const loadImages = async () => {
      if (!item?.tmdb) return;
      const { posterUrl, backdropUrl, overview: tmdbOverview } = await fetchTMDBImages(item.tmdb);
      setPosterUrl(posterUrl);
      setBackdropUrl(backdropUrl);
      setOverview(tmdbOverview);
    };
    loadImages();
  }, [item]);

  const setModalActive = async () => {
    const modal = document.querySelector(`#modal_${item.id}`);
    const modalContent = modal.querySelector(".modal__content");

    try {
      if (!item.slug) return;

      const response = await axiosClient.get(
        `https://ophim1.com/v1/api/phim/${item.slug}`,
      );
      const movieData = response.data;
      setMovie(movieData);
      let trailerUrl = movieData.item.trailer_url;
      if (trailerUrl && trailerUrl.includes("watch?v=")) {
        trailerUrl = trailerUrl.replace("watch?v=", "embed/");
      }

      if (trailerUrl) {
        modalContent.innerHTML = `
          <div style="text-align:center;">
            <iframe width="100%" height="500px" src="${trailerUrl}" title="trailer" frameborder="0" allowfullscreen></iframe>
            <button id="closeBtn_${item.id}" style="margin-top:10px; padding:8px 16px; cursor:pointer; border:none; border-radius:8px; background:#ff4444; color:white;">
              X
            </button>
          </div>
        `;
      } else {
        modalContent.innerHTML = `
          <div style="padding:20px; text-align:center;">
            <p>Không tìm thấy trailer cho phim này.</p>
            <button id="closeBtn_${item.id}" style="margin-top:10px; padding:8px 16px; cursor:pointer; border:none; border-radius:8px; background:#ff4444; color:white;">
              X
            </button>
          </div>
        `;
      }

      const closeBtn = modalContent.querySelector(`#closeBtn_${item.id}`);
      if (closeBtn) {
        closeBtn.addEventListener("click", () => {
          modal.classList.remove("active");
          modalContent.innerHTML = "";
        });
      }

      modal.classList.add("active");
    } catch (err) {
      console.error("Lỗi khi gọi API:", err);
      modalContent.innerHTML = "Lỗi khi tải trailer";
    }
  };

  return (
    <div
      className={`hero-slide__item ${props.className}`}
      style={{ backgroundImage: `url(${backdrop_url})` }}
    >
      <div className="hero-slide__item__content container">
        <div className="hero-slide__item__content__info">
          <h2 className="title">{movie?.item.name || item.name}</h2>
          <div className="overview">
            {(overview
              ? overview
              : movie?.seoOnPage.descriptionHead.replace(/<[^>]+>/g, "")) ||
              "Đang tải..."}
          </div>
          <div className="btns">
            <Button onClick={() => history.push("/movie/" + item.slug)}>
              Xem ngay
            </Button>
            <OutlineButton onClick={setModalActive}>Xem trailer</OutlineButton>
          </div>
        </div>
        <div className="hero-slide__item__content__poster">
          <img src={poster_url} alt="" />
        </div>
      </div>
    </div>
  );
};

const TrailerModal = (props) => {
  const item = props.item;

  const iframeRef = useRef(null);

  const onClose = () => iframeRef.current.setAttribute("src", "");

  return (
    <Modal active={false} id={`modal_${item.id}`}>
      <ModalContent onClose={onClose}>
        <iframe
          ref={iframeRef}
          width="100%"
          height="500px"
          title="trailer"
        ></iframe>
      </ModalContent>
    </Modal>
  );
};

export default HeroSlide;
