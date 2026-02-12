import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import "./movie-list.scss";
import SwiperCore, { Autoplay } from "swiper";

import { SwiperSlide, Swiper } from "swiper/react";

// import { Link } from 'react-router-dom';
// import Button from '../button/Button';
import tmdbApi, { category } from "../../api/tmdbApi";
// import apiConfig from '../../api/apiConfig';
import MovieCard from "../movie-card/MovieCard";

const MovieList = (props) => {
  const [items, setItems] = useState([]);

  /**
   * Lấy danh sách phim
   */
  useEffect(() => {
    const getList = async () => {
      let response = null;
      const params = {};

      if (props.type !== "similar") {
        response = await tmdbApi.getMoviesList(props.type, { params });
      } else {
        // console.log(props.category);
        response = await tmdbApi.getListByType(props.category);
      }
      // console.log(response);
      setItems(response.data.items);
    };
    getList();
  }, []);

  return (
    <div className="movie-list">
      <Swiper
        modules={[Autoplay]}
        grabCursor={true}
        spaceBetween={10}
        slidesPerView={"auto"}
        autoplay={{ delay: 4000 }}
      >
        {items.map((item, i) => (
          <SwiperSlide key={i}>
            <MovieCard item={item} category={props.category} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

MovieList.propTypes = {
  category: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

export default MovieList;
