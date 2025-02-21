import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import HeaderStyle from './header.module.css';

const Header = () => {
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
      const handleScroll = () => {
          const currentScrollY = window.scrollY;
          if (currentScrollY > lastScrollY) {
              setIsScrollingDown(true); // Scrolling down
          } else {
              setIsScrollingDown(false); // Scrolling up
          }
          setLastScrollY(currentScrollY);
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <>
      <div className={HeaderStyle.Spacer}></div>
      <header className={`${HeaderStyle.Header} ${isScrollingDown ? HeaderStyle.HeaderHidden : ""}`}>
        <div className={HeaderStyle.Logo}>EduHub</div>
        <label htmlFor="nav-toggle" className={HeaderStyle.NavToggleLabel}>
          <span></span>
          <span></span>
          <span></span>
        </label>
        <input type="checkbox" id="nav-toggle" className={HeaderStyle.NavToggle} />
        <nav className={HeaderStyle.Nav}>
          <Link to="/login" className={HeaderStyle.Btn}>
            Login
          </Link>
          <Link to="/signup" className={HeaderStyle.Btn}>
            Sign Up
          </Link>
        </nav>
      </header>
    </>
  );
};

export default Header;