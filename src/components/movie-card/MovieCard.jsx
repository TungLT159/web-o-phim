import "./movie-card.scss";

import Button from "../button/Button";
import React, { useState, useEffect } from "react";

// import { category } from "../../api/tmdbApi";
import apiConfig from "../../api/apiConfig";
import axiosClient from "../../api/axiosClient";
import { Link } from "react-router-dom";

const MovieCard = (props) => {
  const item = props.item;

  const link = "/movie/" + item.slug;
  // const bg = apiConfig.w500Image(item.poster_url);
  const [poster_url, setPosterUrl] = useState("/poster-mau.png");
  // const [poster_url, setPosterUrl] = useState("");
  useEffect(() => {
    const fetchImage = async () => {
      if (!item) return;
      try {
        const apiKey = process.env.REACT_APP_TMDB_API_KEY;
        const response = await axiosClient.get(
          `https://api.themoviedb.org/3/${
            item.tmdb.type ? item.tmdb.type : "movie"
          }/${item.tmdb.id}?api_key=${apiKey}&language=vi-VN`
        );
        // console.log(response);
        if (response.poster_path == null) {
          setPosterUrl("/poster-mau.png");
        } else {
          setPosterUrl(apiConfig.w500Image(response.poster_path));
        }
        // console.log(response);
        // console.log(
        //   response.data.image_sizes.poster.original +
        //     response.data.images[response.data.images.length - 2].file_path
        // );
      } catch (error) {
        // setPosterUrl("/noposter.jpg");
        setPosterUrl("/poster-mau.png");
        console.error("Lỗi khi load movie detail:", error);
      }
    };
    fetchImage();
  }, [item]);
  // useEffect(() => {
  //   const fetchImage = async () => {
  //     if (!item.slug) return;
  //     try {
  //       const response = await axiosClient.get(
  //         `https://ophim1.com/v1/api/phim/${item.slug}/images`
  //       );
  //       setPosterUrl(
  //         `${response.data.image_sizes.poster.original}${
  //           response.data.images[response.data.images.length - 2].file_path
  //         }`
  //       );
  //       // console.log(response);
  //       // console.log(
  //       //   response.data.image_sizes.poster.original +
  //       //     response.data.images[response.data.images.length - 2].file_path
  //       // );
  //     } catch (error) {
  //       // setPosterUrl("/noposter.jpg");
  //       setPosterUrl("/poster-mau.png");
  //       console.error("Lỗi khi load movie detail:", error);
  //     }
  //   };
  //   fetchImage();
  // }, [item.slug]);

  return (
    <Link to={link}>
      <div
        className="movie-card"
        style={{ backgroundImage: `url(${poster_url})` }}
      >
        <Button>
          <i className="bx bx-play"></i>
        </Button>
      </div>
      <h3>{item.title || item.name}</h3>
    </Link>
  );
};

export default MovieCard;
