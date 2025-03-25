import React, { useState, useEffect } from 'react';
import { Upload, Button, Input, Divider } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { GetCookie } from '../components/auth/cookies.jsx';
import SettingsStyle from '../assets/styles/settings.module.css';

const newSettings = () => {
  const [user, setUser] = useState([]);
  const [selectedSection, setSelectedSection] = useState('My Account');

  const userData = GetCookie('data');
  const username = userData ? userData.username : null;


  const fetchUserData = () => {
    fetch(`http://localhost:5000/user/${username}`)
    .then(async response => {
      try {
        const data = await response.json();
        setUser(data);
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

  const renderContent = () => {
    switch (selectedSection) {
      case 'My Account':
        return (
          <>
            <div className={SettingsStyle.ProfileHeader}>
              <img src={`http://localhost:5000/avatar/${user.id}`} alt="User" className={SettingsStyle.Avatar} />
              <div className={SettingsStyle.ProfileInfo}>
                <h1>{user.username}</h1>
                <p>{user.email}</p>
                <div className={SettingsStyle.Information}>
                  <p>Joined: {new Date(user.JoinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' })}</p>
                </div>
              </div>
            </div>
          </>
        );
      case 'Purchases':
        return (
          <div>
            <h2>Purchases</h2>
            <Divider />
            <div className={SettingsStyle.Purchases}>
              <h3>Order History</h3>
              <p>No orders found.</p>
            </div>
          </div>
        );
      case 'Subscriptions':
        return (
          <div>
            <h2>Subscriptions</h2>
          </div>
        );
      case 'Data & Privacy':
        return (
          <div>
            <h2>Data & Privacy</h2>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={SettingsStyle.SettingsPage}>
      <div className={SettingsStyle.Sidebar}>
        <div className={SettingsStyle.SliderTitleHolder}>
            <h3>User Settings</h3>
        </div>
        <ul>
          <li className={selectedSection === 'My Account' ? SettingsStyle.Selected : ''} onClick={() => setSelectedSection('My Account')}>My Account</li>
          <li className={selectedSection === 'Purchases' ? SettingsStyle.Selected : ''} onClick={() => setSelectedSection('Purchases')}>Purchases</li>
          <li className={selectedSection === 'Subscriptions' ? SettingsStyle.Selected : ''} onClick={() => setSelectedSection('Subscriptions')}>Subscriptions</li>
          <li className={selectedSection === 'Data & Privacy' ? SettingsStyle.Selected : ''} onClick={() => setSelectedSection('Data & Privacy')}>Data & Privacy</li>
        </ul>
      </div>
      <div className={SettingsStyle.ContentHolder}>
        {renderContent()}
      </div>
    </div>
  );
};

export default newSettings;