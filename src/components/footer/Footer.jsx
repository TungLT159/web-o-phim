import React from "react";
import "./footer.scss";
import bg from "../../assets/footer-bg.jpg";
import logo from "../../assets/tmovie.png";
import { Link } from "react-router-dom";
import { movieType } from "../../api/tmdbApi";

const Footer = () => {
  return (
    <div className="footer" style={{ backgroundImage: `url(${bg})` }}>
      <div className="footer__content container">
        <div className="footer_content_logo">
          <div className="logo">
            <img src={logo} alt="" />
            <Link to="/">Ổ Phim</Link>
          </div>
        </div>
        <div className="footer__content__menus">
          <div className="footer__content__menu">
            <Link to={`/danh-sach/${movieType.phimChieuRap}`}>
              Phim chiếu rạp
            </Link>
            {/* <Link to="/">Contact</Link>
            <Link to="/">Term of services</Link>
            <Link to="/">About us</Link> */}
          </div>
          <div className="footer__content__menu">
            <Link to={`/danh-sach/${movieType.phimMoi}`}>Phim mới</Link>
            {/* <Link to="/">Contact</Link>
            <Link to="/">Term of services</Link>
            <Link to="/">About us</Link> */}
          </div>
          <div className="footer__content__menu">
            <Link to={`/danh-sach/${movieType.phimHoatHinh}`}>
              Phim hoạt hình
            </Link>
            {/* <Link to="/">Contact</Link>
            <Link to="/">Term of services</Link>
            <Link to="/">About us</Link> */}
          </div>
          <div className="footer__content__menu">
            <Link to={`/danh-sach/${movieType.phimLe}`}>Phim lẻ</Link>
            {/* <Link to="/">Contact</Link>
            <Link to="/">Term of services</Link>
            <Link to="/">About us</Link> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
