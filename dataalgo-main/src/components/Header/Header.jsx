import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Avatar, Menu } from 'antd';
import HeaderStyle from './header.module.css';
import UserIcon from "../../assets/images/user.svg";
import Dropdown from '../DropDown/Dropdown.jsx';
import { GetCookie, RemoveCookie } from '../auth/cookies.jsx';

const Header = () => {
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [isDropdownOpen, setisDropdownOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();

  const userData = GetCookie('data');

  const username = userData ? userData.username : null;
  const userid = userData ? userData.id : null;
  const usertoken = userData ? userData.token : null;

  const handleLogout = () => {
    RemoveCookie('data');

  };
  const toggleDropdown = () => {
    setisDropdownOpen(!isDropdownOpen);
  };
  useEffect(() => {
      const handleScroll = () => {
          const currentScrollY = window.scrollY;
          if (currentScrollY > lastScrollY) {
              setIsScrollingDown(true);
              setisDropdownOpen(false);
          } else {
              setIsScrollingDown(false);
              setisDropdownOpen(false);
          }
          setLastScrollY(currentScrollY);
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const menuItems = [
    { label: 'Profile', link: '/profile' },
    { label: 'Settings', link: '/settings' },
    { label: '$0.00' },
    { label: 'Logout', onClick: handleLogout }
  ];

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
              <div className={HeaderStyle.dropdown}>
                <img
                  src={`http://localhost:5000/avatar/${userid}`}
                  alt="User Avatar"
                  className={HeaderStyle.avatar}
                  onClick={toggleDropdown}
                />
                {isDropdownOpen && (
                  <div className={HeaderStyle.menu}>
                    {menuItems.map((item, index) => (
                      <div key={index} className={HeaderStyle.menuItem} onClick={item.onClick}>
                        {item.link ? <Link to={item.link}>{item.label}</Link> : item.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Link to="/post" className={HeaderStyle.Btn}>
                Post
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