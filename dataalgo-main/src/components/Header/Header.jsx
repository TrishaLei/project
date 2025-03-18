import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import HeaderStyle from './header.module.css';
import { Avatar } from 'antd';
import UserIcon from "../../assets/images/user.svg";
import { GetCookie, RemoveCookie } from '../auth/cookies.jsx';

const Header = () => {
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  const userData = GetCookie('data');

  const username = userData ? userData.username : null;
  const usertoken = userData ? userData.token : null;

  const handleLogout = () => {
    RemoveCookie('data');
    navigate('/');
  };

  useEffect(() => {
      const handleScroll = () => {
          const currentScrollY = window.scrollY;
          if (currentScrollY > lastScrollY) {
              setIsScrollingDown(true);
          } else {
              setIsScrollingDown(false);
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

         {!userData ? (
            <>
              <Link to="/login" className={HeaderStyle.Btn}>
                Login
              </Link>
            </>
          ) : (
            <>
            <div style={{ marginLeft: 'auto', marginRight: '20px' }}>
              <Avatar src={'http://localhost:5000/avatar/1'} alt="User Avatar" style={{ borderRadius: '50%', width: '32px', height: '32px', marginRight: '10px' }} />
              <Link to="/post" className={HeaderStyle.Btn}>
                Post
              </Link>
              <Link onClick={handleLogout} className={HeaderStyle.Btn}>
                Logout
              </Link>
            </div>
            </>
          )}

        </nav>
      </header>
    </>
  );
};

export default Header;