import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import PageHeader from "../components/page-header/PageHeader";
import { Helmet } from "react-helmet";
import MovieGrid from "../components/movie-grid/MovieGrid";
import { movieType } from "../api/tmdbApi";

const typeTitles = {
  [movieType.phimChieuRap]: "Phim chiếu rạp",
  [movieType.phimMoi]: "Phim mới",
  [movieType.phimHoatHinh]: "Phim hoạt hình",
  [movieType.phimLe]: "Phim lẻ",
  search: "Tìm kiếm phim",
};

const Catalog = () => {
  const { category, keyword, type } = useParams();
  const location = useLocation();
  const [title, setTitle] = useState("Danh sách phim");
  useEffect(() => {
    // const query = new URLSearchParams(location.search);
    // console.log(query);
    // const type = query.get("type");

    if (keyword) {
      setTitle(`Kết quả tìm kiếm cho "${keyword}"`);
    } else if (category && typeTitles[category]) {
      setTitle(typeTitles[category]);
    } else {
      setTitle("Danh sách phim");
    }
  }, [keyword, location.search, category]);
  return (
    <>
      <Helmet>
        <title>{`${title} | Ổ phim Online HD`}</title>
        <meta
          name="description"
          content={`Khám phá ${title.toLowerCase()} chất lượng cao, cập nhật liên tục. Xem phim online miễn phí tại web phim.`}
        />
        <meta property="og:title" content={`${title} | Ổ phim Online`} />
        <link rel="icon" href="/logo.png" />
        <meta
          property="og:description"
          content={`Kho phim: ${title}. Cập nhật nhanh chóng, xem miễn phí chất lượng HD.`}
        />
        <meta property="og:image" content="/poster-mau.png" />
      </Helmet>
      <PageHeader></PageHeader>
      <div className="container" style={{ maxWidth: "100%" }}>
        <div className="section mb-3">
          <MovieGrid category="Movie" keyword={keyword} />
        </div>
      </div>
    </>
  );
};

export default Catalog;
