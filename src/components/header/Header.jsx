import React, { useRef, useEffect, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./header.scss";
import logo from "../../assets/logo.png";
import tmdbApi from "../../api/tmdbApi";
import { fetchTMDBImagesForItems } from "../../utils/tmdbImageFetcher";
import { headerNav } from "../../constants/navigationData";

const Header = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
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
      navigate(`/movie/search/${keyword}`);
      setKeyword("");
      setIsMobileMenuOpen(false);
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  // ✅ Handle suggestion click with better touch support
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
      navigate(`/movie/${movieId}`);

      // Then cleanup
      setKeyword("");
      setShowSuggestions(false);
      setSuggestions([]);
      setIsMobileMenuOpen(false);
    },
    [navigate],
  );

  // ✅ Handle touch events to prevent scroll-click conflicts
  const handleTouchStart = useCallback((e) => {
    // Mark the touch start position
    e.currentTarget.dataset.touchStartY = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (movie, e) => {
      const touchStartY = parseFloat(e.currentTarget.dataset.touchStartY || 0);
      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = Math.abs(touchEndY - touchStartY);

      // Only trigger click if movement is less than 10px (not scrolling)
      if (deltaY < 10) {
        handleSuggestionClick(movie, e);
      }
    },
    [handleSuggestionClick],
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
                      onTouchStart={handleTouchStart}
                      onTouchEnd={(e) => handleTouchEnd(movie, e)}
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
