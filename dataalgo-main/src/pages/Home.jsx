import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { format, formatDistanceToNow, differenceInYears } from 'date-fns';
import UpArrow from "../assets/images/arrow-big-up.svg";
import DownArrow from "../assets/images/arrow-big-down.svg";

import PostModel from "../assets/styles/PostModel.module.css";
import HomeStyle from "../assets/styles/home.module.css";

import { GetCookie } from '../components/auth/cookies.jsx';

//Alert Components
import AlertComponent from '../components/Alert/AlertComponent.jsx';
import { showAlert } from '../components/Alert/ShowAlert.js';
import Modal from '../components/Modal/Modal.jsx';

const Home = () => {
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [alertVisible, setAlertVisible] = useState(false);
  const [posts, setPosts] = useState([]);
  const [LoggedIn, setLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const handleUpvote = async (postId) => {
    try {
      const userData = GetCookie('data');
      if (!userData) {
        showAlert(setAlert, setAlertVisible, 'error', 'Please login first!');
        return;
      }
      const response = await fetch(`http://localhost:5000/posts/${postId}/upvote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId:userData.id }),
      });
      if (response.ok) {
        const updatedPost = await response.json();
        setPosts(prevPosts => prevPosts.map(post => post.id === postId ? updatedPost : post));
      }
    } catch (error) {
      console.error('Error upvoting post:', error);
    }
  };

  const handleDownvote = async (postId) => {
    try {
      const userData = GetCookie('data');
      if (!userData) {
        showAlert(setAlert, setAlertVisible, 'error', 'Please login first!');
        return;
      }
      const response = await fetch(`http://localhost:5000/posts/${postId}/downvote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId:userData.id }),
      });
      if (response.ok) {
        const updatedPost = await response.json();
        setPosts(prevPosts => prevPosts.map(post => post.id === postId ? updatedPost : post));
      }
    } catch (error) {
      console.error('Error downvoting post:', error);
    }
  };

  useEffect(() => {
    fetch('http://localhost:5000/posts')
    .then(async response => {
      try {
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts :', error);
      }
    }).catch(error => {
      console.error('Error:', error);
    });

    const userData = GetCookie('data');
    if (userData) {
      setLoggedIn(false);
      setUserId(userData.id);
    } else {
      setLoggedIn(true);
    }
    
  }, []);

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

  const openModal = (title, content) => {
    setModalContent({ title, content });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
  };

  return (
    <>
      <AlertComponent alert={alert} setAlert={setAlert} alertVisible={alertVisible} />
      <main className={HomeStyle.HomeContent}>
      {LoggedIn ? (
        <>
        <section className={HomeStyle.Hero}>
          <h1>Welcome to EduHub!</h1>
          <p>
            Your go-to platform for sharing and discovering educational
            resources.
          </p>
        </section>
        </>
      ) : null}


        <section className={PostModel.Posts}>
          {posts.length === 0 ? (
            <p>No posts available</p>
          ) : (
            posts.map(post => (
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
                {(() => {
                  switch (post.contentType) {
                    case 1:
                      return (
                        <>
                          {post.isSubscribed ? (
                            <>
                              <div className={PostModel.PostActions}>  
                                <button className={PostModel.PostActionsButton} onClick={() => openModal('Subscribe', 'Are you sure you want to subscribe to this content?')}>Subscribe</button>
                              </div>
                            </>
                          ) : (
                            <div className={PostModel.LockedContainer}>
                              <p>This content is locked. Please subscribe to access.</p>
                              <button className={PostModel.PostActionsButton} onClick={() => openModal('Subscribe', 'Are you sure you want to subscribe to this content?')}>Subscribe</button>
                            </div>
                          )}
                          <div className={PostModel.PostActions}>
                          <button onClick={() => handleUpvote(post.id)} className={`${PostModel.PostActionsButton} ${PostModel.ButtonVote} ${post.upvotes.includes(userId) ? PostModel.ButtonVoted : ''}`}>
                            <img src={UpArrow} alt="Upvote" />
                          </button>
                          <p>{post.upvotes.length - post.downvotes.length}</p>
                          <button onClick={() => handleDownvote(post.id)} className={`${PostModel.PostActionsButton} ${PostModel.ButtonVote} ${post.downvotes.includes(userId) ? PostModel.ButtonVoted : ''}`}>
                            <img src={DownArrow} alt="Downvote" />
                          </button>
                        </div>
                        </>
                      );
                    case 2:
                      return (
                        <>
                          {post.isPurchased ? (
                            <>
                              <p className={PostModel.PostPrice}>${post.price.toFixed(2)}</p>
                              <div className={PostModel.PostActions}>  
                                <button className={PostModel.PostActionsButton} onClick={() => openModal('Buy Now', 'Are you sure you want to subscribe to this content?')}>Buy Now</button>
                              </div>
                            </>
                          ) : (
                            <div className={PostModel.LockedContainer}>
                              <p>This content is locked. Please purchase to access.</p>
                              <p className={PostModel.PostPrice}>${post.price.toFixed(2)}</p>
                              <button className={PostModel.PostActionsButton} onClick={() => openModal('Buy Now', 'Are you sure you want to subscribe to this content?')}>Buy Now</button>
                            </div>
                          )}
                          <div className={PostModel.PostActions}>
                            <button onClick={() => handleUpvote(post.id)} className={`${PostModel.PostActionsButton} ${PostModel.ButtonVote} ${post.upvotes.includes(userId) ? PostModel.ButtonVoted : ''}`}>
                              <img src={UpArrow} alt="Upvote" />
                            </button>
                            <p>{post.upvotes.length - post.downvotes.length}</p>
                            <button onClick={() => handleDownvote(post.id)} className={`${PostModel.PostActionsButton} ${PostModel.ButtonVote} ${post.downvotes.includes(userId) ? PostModel.ButtonVoted : ''}`}>
                              <img src={DownArrow} alt="Downvote" />
                            </button>
                          </div>
                        </>
                      );
                    default:
                      return (
                        <div className={PostModel.PostActions}>
                          <button onClick={() => handleUpvote(post.id)} className={`${PostModel.PostActionsButton} ${PostModel.ButtonVote} ${post.upvotes.includes(userId) ? PostModel.ButtonVoted : ''}`}>
                            <img src={UpArrow} alt="Upvote" />
                          </button>
                          <p>{post.upvotes.length - post.downvotes.length}</p>
                          <button onClick={() => handleDownvote(post.id)} className={`${PostModel.PostActionsButton} ${PostModel.ButtonVote} ${post.downvotes.includes(userId) ? PostModel.ButtonVoted : ''}`}>
                            <img src={DownArrow} alt="Downvote" />
                          </button>
                        </div>
                      );
                  }
                })()}
              </div>
            ))
          )}
        </section>
      </main>
      <Modal show={isModalOpen} onClose={closeModal}>
        <h2>{modalContent?.title}</h2>
        <p>{modalContent?.content}</p>
      </Modal>
    </>
  );
};

export default Home;
