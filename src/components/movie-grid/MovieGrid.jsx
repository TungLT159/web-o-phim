// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router";
// import tmdbApi, { movieType, tvType } from "../../api/tmdbApi";
// import "./movie-grid.scss";
// import MovieCard from "../movie-card/MovieCard";
// import { OutlineButton } from "../button/Button";

// const MovieGrid = (props) => {
//   const [items, setItems] = useState([]);
//   const [page, setPage] = useState(1);
//   const [title, setTitle] = useState("");
//   const [totalPage, setTotalPage] = useState(0);

//   const { keyword, category } = useParams();

//   useEffect(() => {
//     const getList = async () => {
//       let response = null;

//       if (keyword === undefined) {
//         // 🔹 Không có keyword → lấy list mặc định
//         const params = {};
//         response = await tmdbApi.getMoviesList(category, { params });
//       } else {
//         // 🔹 Có keyword → search
//         const params = { keyword: keyword };
//         response = await tmdbApi.search(props.category, { params });
//       }
//       console.log(response);
//       if (response) {
//         const totalItems = response.data.params.pagination.totalItems || 0;
//         const totalItemsPerPage =
//           response.data.params.pagination.totalItemsPerPage || 1;
//         setTitle(response.data.titlePage || "");
//         setItems(response.data.items || []);
//         setPage(response.data.params.pagination.currentPage || 1);
//         setTotalPage(Math.ceil(totalItems / totalItemsPerPage) || 0);
//       }
//     };
//     getList();
//   }, [props, keyword, category]);

//   const loadMore = async () => {
//     let response = null;
//     if (keyword === undefined) {
//       const params = {
//         page: page + 1,
//       };
//       switch (props.category) {
//         case category.movie:
//           response = await tmdbApi.getMoviesList(movieType.upcoming, {
//             params,
//           });
//           break;
//         default:
//           response = await tmdbApi.getTvList(tvType.popular, { params });
//       }
//     } else {
//       const params = {
//         page: page + 1,
//         query: keyword,
//       };
//       response = await tmdbApi.search(props.category, { params });
//     }
//     setItems([...items, ...response.results]);
//     setTotalPage(page + 1);
//   };

//   return (
//     <>
//       <div className="section mb-3">
//         {/* <MovieSearch category={props.category} keyword={keyword} /> */}
//       </div>
//       {title && <h2 className="movie-grid__title">{title}</h2>}

//       <div className="movie-grid">
//         {items.map((item, i) => (
//           <MovieCard category={props.category} item={item} key={i} />
//         ))}
//       </div>

//       {page < totalPage ? (
//         <OutlineButton className="small" onClick={loadMore}>
//           Tải thêm
//         </OutlineButton>
//       ) : null}
//     </>
//   );
// };

// export default MovieGrid;
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";
import tmdbApi from "../../api/tmdbApi";
import "./movie-grid.scss";
import MovieCard from "../movie-card/MovieCard";

const MovieGrid = (props) => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [title, setTitle] = useState("");
  const [totalPage, setTotalPage] = useState(0);

  const { keyword, category, type } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const pageFromUrl = parseInt(query.get("page")) || 1;
  const getList = async (pageNumber = 1) => {
    let response = null;
    try {
      console.log(keyword, category, type);
      if (keyword === undefined) {
        if (category === "the-loai") {
          response = await tmdbApi.getListByType(type, {
            page: pageNumber,
            limit: 28,
          });
        } else if (category === "quoc-gia") {
          response = await tmdbApi.getListByCountry(type, {
            page: pageNumber,
            limit: 28,
          });
        } else {
          response = await tmdbApi.getMoviesList(type, {
            page: pageNumber,
            limit: 28,
          });
        }
      } else {
        response = await tmdbApi.search(props.category, {
          keyword,
          limit: 28,
          page: pageNumber,
        });
      }

      if (response && response.data) {
        const pagination = response.data.params?.pagination || {};
        const totalItems = pagination.totalItems || 0;
        const totalItemsPerPage = pagination.totalItemsPerPage || 1;

        setTitle(response.data.titlePage || "");
        setItems(response.data.items || []);
        setPage(pageNumber); // luôn tin pageNumber
        setTotalPage(Math.ceil(totalItems / totalItemsPerPage) || 0);

        navigate({
          pathname: location.pathname,
          search: `?page=${pageNumber}`,
        }, { replace: true });
      }
    } catch (error) {
      console.error("Lỗi gọi API:", error);
    }
  };

  useEffect(() => {
    getList(pageFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.category, keyword, category, type, pageFromUrl]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPage && newPage !== page) {
      window.scrollTo({ top: 0, behavior: "smooth" }); // ✅ scroll mượt lên đầu

      // ✅ cập nhật query param page
      const searchParams = new URLSearchParams(location.search);
      searchParams.set("page", newPage);
      navigate({
        pathname: location.pathname,
        search: searchParams.toString(),
      });
      getList(newPage);
    }
  };

  const getPagination = (current, total) => {
    let pages = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages = [1];
      if (current > 4) pages.push("...");
      let start = Math.max(2, current - 2);
      let end = Math.min(total - 1, current + 2);
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < total - 1) pages.push("...");
      pages.push(total);
    }
    return pages;
  };

  return (
    <>
      {title && <h2 className="movie-grid__title">{title}</h2>}

      <div className="movie-grid">
        {items.map((item, i) => (
          <MovieCard
            category={props.category}
            item={item}
            key={item._id || i}
          />
        ))}
      </div>

      {totalPage > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            &lt;
          </button>

          {getPagination(page, totalPage).map((p, i) =>
            p === "..." ? (
              <span key={i} className="dots">
                ...
              </span>
            ) : (
              <button
                key={i}
                className={page === p ? "active" : ""}
                onClick={() => handlePageChange(p)}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPage}
          >
            &gt;
          </button>
        </div>
      )}
    </>
  );
};

export default MovieGrid;
