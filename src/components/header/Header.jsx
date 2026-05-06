// import React, { useRef, useEffect, useState } from "react";
// import { Link, useLocation, useHistory } from "react-router-dom";

// import "./header.scss";
// import logo from "../../assets/tmovie.png";

// const headerNav = [
//   {
//     display: "Trang chủ",
//     path: "/",
//   },
//   {
//     display: "Phim",
//     path: "/movie",
//   },
// ];

// const Header = () => {
//   const { pathname } = useLocation();
//   const history = useHistory();
//   const headerRef = useRef(null);

//   const [keyword, setKeyword] = useState("");

//   const active = headerNav.findIndex((e) => e.path === pathname);

//   useEffect(() => {
//     const shrinkHeader = () => {
//       if (
//         document.body.scrollTop > 100 ||
//         document.documentElement.scrollTop > 100
//       ) {
//         headerRef.current.classList.add("shrink");
//       } else {
//         headerRef.current.classList.remove("shrink");
//       }
//     };
//     window.addEventListener("scroll", shrinkHeader);
//     return () => {
//       window.removeEventListener("scroll", shrinkHeader);
//     };
//   }, []);

//   const goToSearch = (e) => {
//     e.preventDefault();
//     if (keyword.trim().length > 0) {
//       history.push(`/movie/search/${keyword}`);
//       setKeyword("");
//     }
//   };

//   return (
//     <div ref={headerRef} className="header">
//       <div className="header__wrap container">
//         <div className="logo">
//           <img src={logo} alt="" />
//           <Link to="/">XemPhim</Link>
//         </div>

//         <ul className="header__nav">
//           {headerNav.map((e, i) => (
//             <li key={i} className={`${i === active ? "active" : ""}`}>
//               <Link to={e.path}>{e.display}</Link>
//             </li>
//           ))}
//         </ul>

//         {/* Search box */}
//         <form className="header__search" onSubmit={goToSearch}>
//           <input
//             className="search-input"
//             type="text"
//             placeholder="Nhập tên phim..."
//             value={keyword}
//             onChange={(e) => setKeyword(e.target.value)}
//           />
//           <button type="submit" className="search-btn">
//             🔍
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Header;
import React, { useRef, useEffect, useState, useCallback } from "react";
import { Link, useLocation, useHistory } from "react-router-dom";
import "./header.scss";
import logo from "../../assets/tmovie.png";
import tmdbApi from "../../api/tmdbApi";
import { fetchTMDBImagesForItems } from "../../utils/tmdbImageFetcher";

const Header = () => {
  const { pathname } = useLocation();
  const history = useHistory();
  const headerRef = useRef(null);

  const [keyword, setKeyword] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestionPosition, setSuggestionPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const searchRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const headerNav = [
    {
      display: "Danh sách",
      submenu: [
        { display: "Phim mới", path: "/danh-sach/phim-moi" },
        { display: "Phim bộ", path: "/danh-sach/phim-bo" },
        { display: "Phim lẻ", path: "/danh-sach/phim-le" },
        { display: "TV Shows", path: "/danh-sach/tv-shows" },
        { display: "Hoạt hình", path: "/danh-sach/hoat-hinh" },
        { display: "Phim Vietsub", path: "/danh-sach/phim-vietsub" },
        { display: "Phim Thuyết minh", path: "/danh-sach/phim-thuyet-minh" },
        { display: "Phim Lồng tiếng", path: "/danh-sach/phim-long-tien" },
        {
          display: "Phim bộ đang chiếu",
          path: "/danh-sach/phim-bo-dang-chieu",
        },
        {
          display: "Phim bộ hoàn thành",
          path: "/danh-sach/phim-bo-hoan-thanh",
        },
        { display: "Phim sắp chiếu", path: "/danh-sach/phim-sap-chieu" },
        { display: "Subteam", path: "/danh-sach/subteam" },
        { display: "Phim chiếu rạp", path: "/danh-sach/phim-chieu-rap" },
      ],
    },
    {
      display: "Quốc Gia",
      submenu: [
        { display: "Việt Nam", path: "/quoc-gia/viet-nam" },
        { display: "Hàn Quốc", path: "/quoc-gia/han-quoc" },
        { display: "Âu Mỹ", path: "/quoc-gia/au-my" },
        { display: "Nhật Bản", path: "/quoc-gia/nhat-ban" },
        { display: "Trung Quốc", path: "/quoc-gia/trung-quoc" },
      ],
    },
    {
      display: "Thể Loại",
      submenu: [
        { display: "Hành Động", path: "/the-loai/hanh-dong" },
        { display: "Tình Cảm", path: "/the-loai/tinh-cam" },
        { display: "Hài Hước", path: "/the-loai/hai-huoc" },
        { display: "Tâm Lý", path: "/the-loai/tam-ly" },
        { display: "Hình Sự", path: "/the-loai/hinh-su" },
        { display: "Chiến Tranh", path: "/the-loai/chien-tranh" },
        { display: "Võ Thuật", path: "/the-loai/vo-thuat" },
        { display: "Viễn Tưởng", path: "/the-loai/vien-tuong" },
        { display: "Phiêu Lưu", path: "/the-loai/phieu-luu" },
        { display: "Khoa Học", path: "/the-loai/khoa-hoc" },
        { display: "Kinh Dị", path: "/the-loai/kinh-di" },
        { display: "Thần Thoại", path: "/the-loai/than-thoai" },
        { display: "Tài Liệu", path: "/the-loai/tai-lieu" },
        { display: "Gia Đình", path: "/the-loai/gia-dinh" },
        { display: "Chính Kịch", path: "/the-loai/chinh-kich" },
        { display: "Học Đường", path: "/the-loai/hoc-duong" },
      ],
    },
  ];
  const active = headerNav.findIndex((e) =>
    e.submenu?.some((sub) => pathname.startsWith(sub.path)),
  );

  useEffect(() => {
    const shrinkHeader = () => {
      if (
        document.body.scrollTop > 100 ||
        document.documentElement.scrollTop > 100
      ) {
        headerRef.current.classList.add("shrink");
      } else {
        headerRef.current.classList.remove("shrink");
      }
    };
    window.addEventListener("scroll", shrinkHeader);
    return () => window.removeEventListener("scroll", shrinkHeader);
  }, []);

  // ✅ Update suggestion position on scroll and resize
  useEffect(() => {
    const updatePosition = () => {
      if (searchRef.current && showSuggestions) {
        const rect = searchRef.current.getBoundingClientRect();
        setSuggestionPosition({
          top: rect.bottom,
          left: rect.left,
          width: rect.width,
        });
      }
    };

    if (showSuggestions) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
    }

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [showSuggestions]);

  // ✅ Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        // Check if click is on suggestion dropdown
        const suggestionDropdown = document.querySelector(
          ".search-suggestions",
        );
        if (suggestionDropdown && suggestionDropdown.contains(event.target)) {
          return; // Don't close if clicking inside suggestions
        }
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Fetch search suggestions with debounce
  const fetchSuggestions = useCallback(async (searchKeyword) => {
    if (searchKeyword.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await tmdbApi.search("movie", {
        keyword: searchKeyword,
        limit: 8,
      });
      const items = response.data?.items || [];

      // Fetch TMDB images for all items using the helper function
      const itemsWithImages = await fetchTMDBImagesForItems(items);

      setSuggestions(itemsWithImages);
      setShowSuggestions(itemsWithImages.length > 0);

      // Calculate position for dropdown
      if (searchRef.current && itemsWithImages.length > 0) {
        const rect = searchRef.current.getBoundingClientRect();
        setSuggestionPosition({
          top: rect.bottom,
          left: rect.left,
          width: rect.width,
        });
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // ✅ Handle search input change with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setKeyword(value);

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const goToSearch = (e) => {
    e.preventDefault();
    if (keyword.trim().length > 0) {
      history.push(`/movie/search/${keyword}`);
      setKeyword("");
      setIsMobileMenuOpen(false);
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  // ✅ Handle suggestion click
  const handleSuggestionClick = useCallback(
    (movie, e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      console.log("Movie clicked:", movie); // Debug log

      // Navigate immediately - use slug field from API
      const movieId = movie.slug || movie._id;
      console.log("Navigating to:", `/movie/${movieId}`);
      history.push(`/movie/${movieId}`);

      // Then cleanup
      setKeyword("");
      setShowSuggestions(false);
      setSuggestions([]);
      setIsMobileMenuOpen(false);
    },
    [history],
  );

  const toggleSubmenu = (index) => {
    setOpenSubmenu(openSubmenu === index ? null : index);
  };

  return (
    <>
      <div ref={headerRef} className="header">
        <div className="header__wrap container">
          {/* Logo */}
          <div className="logo">
            <img src={logo} alt="" />
            <Link to="/">Ổ Phim</Link>
          </div>

          {/* Hamburger */}
          <div className="hamburger" onClick={() => setIsMobileMenuOpen(true)}>
            ☰
          </div>

          {/* Desktop Nav */}
          <ul className="header__nav desktop">
            {headerNav.map((e, i) => (
              <li
                key={i}
                className={`nav-item ${i === active ? "active" : ""}`}
              >
                <span>{e.display}</span>

                <ul className="nav-submenu">
                  {e.submenu?.map((sub, idx) => (
                    <li key={idx}>
                      <Link to={sub.path}>{sub.display}</Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>

          {/* Search */}
          <form
            className="header__search"
            onSubmit={goToSearch}
            ref={searchRef}
          >
            <input
              type="text"
              placeholder="Nhập tên phim..."
              value={keyword}
              onChange={handleSearchChange}
              onFocus={() =>
                keyword.trim().length >= 2 &&
                suggestions.length > 0 &&
                setShowSuggestions(true)
              }
            />
            <button type="submit">🔍</button>
          </form>
        </div>
      </div>

      {/* Search Suggestions Dropdown - Outside header, position fixed */}
      {showSuggestions && (
        <div
          className="search-suggestions"
          style={{
            top: `${suggestionPosition.top}px`,
            left: `${suggestionPosition.left}px`,
            width: `${suggestionPosition.width}px`,
          }}
        >
          {isSearching ? (
            <div className="suggestion-loading">Đang tìm kiếm...</div>
          ) : (
            <>
              {suggestions.map((movie) => (
                <div
                  key={movie._id}
                  className="suggestion-item"
                  onClick={(e) => handleSuggestionClick(movie, e)}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <div
                    className="suggestion-poster"
                    style={{
                      backgroundImage: `url(${movie.tmdb_poster || movie.thumb_url || movie.poster_url || "/poster-mau.png"})`,
                    }}
                  ></div>
                  <div className="suggestion-info">
                    <div className="suggestion-title">{movie.name}</div>
                    <div className="suggestion-meta">
                      {movie.year && <span>{movie.year}</span>}
                      {movie.quality && (
                        <span className="quality">{movie.quality}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? "active" : ""}`}>
        <div className="mobile-header">
          <span>Menu</span>
          <button onClick={() => setIsMobileMenuOpen(false)}>✕</button>
        </div>
        {/* 🔥 Mobile Search */}
        <form className="mobile-search" onSubmit={goToSearch}>
          <input
            type="text"
            placeholder="Nhập tên phim..."
            value={keyword}
            onChange={handleSearchChange}
          />
          <button type="submit">🔍</button>

          {/* Mobile Search Suggestions */}
          {showSuggestions && (
            <div className="search-suggestions mobile">
              {isSearching ? (
                <div className="suggestion-loading">Đang tìm kiếm...</div>
              ) : (
                <>
                  {suggestions.map((movie) => (
                    <div
                      key={movie._id}
                      className="suggestion-item"
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        handleSuggestionClick(movie, e);
                      }}
                      onClick={(e) => handleSuggestionClick(movie, e)}
                    >
                      <div
                        className="suggestion-poster"
                        style={{
                          backgroundImage: `url(${movie.tmdb_poster || movie.thumb_url || movie.poster_url || "/poster-mau.png"})`,
                        }}
                      ></div>
                      <div className="suggestion-info">
                        <div className="suggestion-title">{movie.name}</div>
                        <div className="suggestion-meta">
                          {movie.year && <span>{movie.year}</span>}
                          {movie.quality && (
                            <span className="quality">{movie.quality}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </form>
        <ul>
          {headerNav.map((e, i) => (
            <li key={i}>
              <div className="mobile-parent" onClick={() => toggleSubmenu(i)}>
                {e.display}
                <span>{openSubmenu === i ? "-" : "+"}</span>
              </div>

              <ul
                className={`mobile-submenu ${openSubmenu === i ? "show" : ""}`}
              >
                {e.submenu?.map((sub, idx) => (
                  <li key={idx}>
                    <Link
                      to={sub.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {sub.display}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div className="overlay" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </>
  );
};

export default Header;
