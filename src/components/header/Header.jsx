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
import React, { useRef, useEffect, useState } from "react";
import { Link, useLocation, useHistory } from "react-router-dom";
import "./header.scss";
import logo from "../../assets/tmovie.png";

const Header = () => {
  const { pathname } = useLocation();
  const history = useHistory();
  const headerRef = useRef(null);

  const [keyword, setKeyword] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
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

  const goToSearch = (e) => {
    e.preventDefault();
    if (keyword.trim().length > 0) {
      history.push(`/movie/search/${keyword}`);
      setKeyword("");
      setIsMobileMenuOpen(false);
    }
  };

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
          <form className="header__search" onSubmit={goToSearch}>
            <input
              type="text"
              placeholder="Nhập tên phim..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button type="submit">🔍</button>
          </form>
        </div>
      </div>

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
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button type="submit">🔍</button>
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
