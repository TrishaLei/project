import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { UserOutlined, SettingOutlined, DollarOutlined, LogoutOutlined } from '@ant-design/icons';
import HeaderStyle from './header.module.css';
import { GetCookie, RemoveCookie } from '../auth/cookies.jsx';
import Paypal from '../TopUp/Paypal.jsx';

const Header = () => {
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [isDropdownOpen, setisDropdownOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [userDataServer, setuserDataServer] = useState([]);
  const [isPayPalPopupOpen, setIsPayPalPopupOpen] = useState(false);

  const userData = GetCookie('data');
  const username = userData ? userData.username : null;
  const userid = userData ? userData.id : null;
  const usertoken = userData ? userData.token : null;

  const handleLogout = () => {
    RemoveCookie('data');
    window.location.reload();
  };
  const toggleDropdown = () => {
    setisDropdownOpen(!isDropdownOpen);
  };
  const togglePayPalPopup = () => {
    setIsPayPalPopupOpen(!isPayPalPopupOpen);
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

  const fetchUserData = () => {
    fetch(`http://localhost:5000/user/${username}`)
    .then(async response => {
      try {
        const data = await response.json();
        setuserDataServer(data);
      } catch (error) {
        console.error('Error fetching userdata :', error);
      }
    }).catch(error => {
      console.error('Error:', error);
    });
  };

  useEffect(() => {
    fetchUserData();
    const handleUserDataUpdate = () => {
      fetchUserData();
    };

    window.addEventListener('userDataUpdate', handleUserDataUpdate);

    return () => {
      window.removeEventListener('userDataUpdate', handleUserDataUpdate);
    };
  }, [username]);

  const menuItems = [
    { label: 'Profile', link: `/profile/${username}`, icon: <UserOutlined /> },
    { label: 'Settings', link: '/settings', icon: <SettingOutlined /> },
    { label: `$${userDataServer && userDataServer.balance ? (Math.floor(userDataServer.balance * 100) / 100).toFixed(2) : '0.00'}`, link: '#', icon: <DollarOutlined />, onClick: togglePayPalPopup },
    { label: 'Logout', onClick: handleLogout, icon: <LogoutOutlined /> }
  ];

  return (
    <>
      <div className={HeaderStyle.Spacer}></div>
      <header className={`${HeaderStyle.Header} ${isScrollingDown ? HeaderStyle.HeaderHidden : ""}`}>
        <Link to="/" className={HeaderStyle.Logo}>EduHub</Link>
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
            <div className={HeaderStyle.AvatarContainer}>
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
                        {item.icon}
                        {item.link ? <Link className={HeaderStyle.menuItemLink} to={item.link}>{item.label}</Link> : item.label}
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
      {isPayPalPopupOpen && <Paypal onClose={togglePayPalPopup} UserId={userid} />}
    </>
  );
};

export default Header;