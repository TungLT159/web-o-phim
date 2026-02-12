import React from "react";
import { Link } from "react-router-dom";
import { OutlineButton } from "../components/button/Button";
import HeroSlide from "../components/hero-slide/HeroSlide";
import MovieList from "../components/movie-list/MovieList";
import { category, movieType } from "../api/tmdbApi";
import { Helmet } from "react-helmet";

export default function Home() {
  return (
    <div>
      <Helmet>
        <title>Trang chủ | Ổ Phim chất lượng HD</title>
        <meta
          name="description"
          content="Xem phim online miễn phí, chất lượng HD. Cập nhật nhanh nhất các bộ phim chiếu rạp, phim lẻ, phim hoạt hình và phim mới."
        />
        <meta property="og:title" content="Trang chủ | Ổ Phim" />
        <meta
          property="og:description"
          content="Kho phim online miễn phí chất lượng HD - Phim chiếu rạp, phim lẻ, phim hoạt hình và nhiều thể loại khác."
        />
        <meta property="og:image" content="/poster-mau.png" />
      </Helmet>
      <HeroSlide />
      <div className="section mb-3">
        <div className="section__header mb-2">
          <h2>Phim chiếu rạp</h2>
          <Link to={`/danh-sach/${movieType.phimChieuRap}`}>
            <OutlineButton>Xem thêm</OutlineButton>
          </Link>
        </div>
        <MovieList category={category.movie} type={movieType.phimChieuRap} />
      </div>

      <div className="section mb-3">
        <div className="section__header mb-2">
          <h2>Phim mới</h2>
          <Link to={`/danh-sach/${movieType.phimMoi}`}>
            <OutlineButton>Xem thêm</OutlineButton>
          </Link>
        </div>
        <MovieList category={category.movie} type={movieType.phimMoi} />
      </div>

      <div className="section mb-3">
        <div className="section__header mb-2">
          <h2>Phim hoạt hình</h2>
          <Link to={`/danh-sach/${movieType.phimHoatHinh}`}>
            <OutlineButton>Xem thêm</OutlineButton>
          </Link>
        </div>
        <MovieList category={category.movie} type={movieType.phimHoatHinh} />
      </div>

      <div className="section mb-3">
        <div className="section__header mb-2">
          <h2>Phim lẻ</h2>
          <Link to={`/danh-sach/${movieType.phimLe}`}>
            <OutlineButton>Xem thêm</OutlineButton>
          </Link>
        </div>
        <MovieList category={category.movie} type={movieType.phimLe} />
      </div>
    </div>
  );
}
