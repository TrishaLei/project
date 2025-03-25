import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, formatDistanceToNow, differenceInYears } from 'date-fns';
import { Upload, Button, Input, Divider } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { GetCookie } from '../components/auth/cookies.jsx';
import SettingsStyle from '../assets/styles/settings.module.css';
import PostModel from "../assets/styles/PostModel.module.css";

const newSettings = () => {
  const [user, setUser] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedSection, setSelectedSection] = useState('My Account');

  const userData = GetCookie('data');
  const username = userData ? userData.username : null;


  const FetchUserAvatar = (id) => {
    fetch(`http://localhost:5000/avatar/${id}`, {
      method: 'GET',
    }).then(async response => {{
      const data = await response.json();
      return data;
    }}).catch(error => {
      console.error('Error:', error);
    })
  };
  const fetchUserData = () => {
    fetch(`http://localhost:5000/user/${username}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${userData.token}`
      }
    })
    .then(async response => {
      try {
        const data = await response.json();
        setUser(data);
        
        fetch(`http://localhost:5000/purchased/${data.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${userData.token}`
          }
        })
        .then(async response => {
          try {
            const data = await response.json();
            console.log(data);
            setPosts(data);
          } catch (error) {
            console.error('Error fetching userdata :', error);
          }
        }).catch(error => {
          console.error('Error:', error);
        });

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

  const getClassName = (contentType) => {
    switch (contentType) {
      case 1:
        return PostModel.PostSubscription;
      case 2:
        return PostModel.PostPremium;
      default:
        return '';
    }
  };

  const renderContent = () => {
    switch (selectedSection) {
      case 'My Account':
        return (
          <>
            <div className={SettingsStyle.ProfileHeader}>
              <img src={`http://localhost:5000/avatar/${userData.id}`} alt="User" className={SettingsStyle.Avatar} />
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
            <h2>Purchases History</h2>
            <Divider />
            <div className={SettingsStyle.PurchasesContainer}>
              {posts.length === 0 ? (
                <div className={SettingsStyle.Purchases}>
                  <h3>Purchase History</h3>
                  <p>No purchases found.</p>
                </div>
              ) : (
                <div className={SettingsStyle.Purchases}>
                  {posts.map(post => (
                    <div key={post.id} className={`${PostModel.Post} ${getClassName(post.contentType)}`}>
                      <div className={PostModel.PostHeader}>
                        <h2 className={PostModel.PostTitle}>{post.title}</h2>
                        <span className={PostModel.PostTimestamp}>
                          {differenceInYears(new Date(), new Date(post.PostDate)) >= 1
                            ? format(new Date(post.PostDate), 'MMMM d, yyyy')
                            : formatDistanceToNow(new Date(post.PostDate), { addSuffix: true })}
                        </span>
                      </div>
                      <p className={PostModel.PostTags}>Tags: {post.tags}</p>
                        <p className={PostModel.PostAuthor}>
                          Posted by
                          <img src={ `http://localhost:5000/avatar/${post.userId}`}  className={PostModel.PostAuthorIcon}alt="User" />
                          <Link to={`/profile/${post.username}`} className={PostModel.PostAuthorName}>
                            <span>{post.username}</span>
                          </Link>
                      </p>
                      <div className={PostModel.PostActions}>
                        <Button type="primary" onClick={() => window.open(`/post/${post.id}`, '_blank')}>View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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