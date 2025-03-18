import { useState, useEffect } from 'react';
import UpArrow from "../assets/images/arrow-big-up.svg";
import DownArrow from "../assets/images/arrow-big-down.svg";

import HomeStyle from "../assets/styles/home.module.css";
import "../assets/styles/home.css";

import { GetCookie } from '../components/auth/cookies.jsx';

//Alert Components
import AlertComponent from '../components/Alert/AlertComponent.jsx';
import { showAlert } from '../components/Alert/ShowAlert.js';

const Home = () => {
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [alertVisible, setAlertVisible] = useState(false);
  const [posts, setPosts] = useState([]);
  const [LoggedIn, setLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);

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
        return 'subscription';
      case 2:
        return 'premium';
      default:
        return '';
    }
  };

  return (
    <>
      <AlertComponent alert={alert} setAlert={setAlert} alertVisible={alertVisible} />
      <main className="content">
      {LoggedIn ? (
        <>
        <section className="hero">
          <h1>Welcome to EduHub!</h1>
          <p>
            Your go-to platform for sharing and discovering educational
            resources.
          </p>
        </section>
        </>
      ) : null}


        <section className="posts">
          {posts.length === 0 ? (
            <p>No posts available</p>
          ) : (
            posts.map(post => (
              <div key={post.id} className={`post ${getClassName(post.contentType)}`}>
                <h2 className="post-title">{post.title}</h2>
                <p className="post-tags">Tags: {post.tags}</p>
                <p className="post-author">
                  Posted by
                  <span className="icon">
                    <img src={ `http://localhost:5000/avatar/${post.userId}`} alt="User" />
                  </span>
                  <span>{post.username}</span>
                </p>
                {(() => {
                  switch (post.contentType) {
                    case 1:
                      return (
                        <>
                          <div className="post-actions">  
                            <button className="btn buy">Subscribe</button>
                          </div>
                          <div className="post-actions">
                          <button onClick={() => handleUpvote(post.id)} className={`btn btn-vote ${post.upvotes.includes(userId) ? 'voted' : ''}`}>
                            <img src={UpArrow} alt="Upvote" />
                          </button>
                          <button onClick={() => handleDownvote(post.id)} className={`btn btn-vote ${post.downvotes.includes(userId) ? 'voted' : ''}`}>
                            <img src={DownArrow} alt="Downvote" />
                          </button>
                        </div>
                        </>
                      );
                    case 2:
                      return (
                        <>
                          <p className="post-price">${post.price.toFixed(2)}</p>
                          <div className="post-actions">  
                            <button className="btn buy">Buy Now</button>
                          </div>
                          <div className="post-actions">
                          <button onClick={() => handleUpvote(post.id)} className={`btn btn-vote ${post.upvotes.includes(userId) ? 'voted' : ''}`}>
                            <img src={UpArrow} alt="Upvote" />
                          </button>
                          <button onClick={() => handleDownvote(post.id)} className={`btn btn-vote ${post.downvotes.includes(userId) ? 'voted' : ''}`}>
                            <img src={DownArrow} alt="Downvote" />
                          </button>
                        </div>
                        </>
                      );
                    default:
                      return (
                        <div className="post-actions">
                          <button onClick={() => handleUpvote(post.id)} className={`btn btn-vote ${post.upvotes.includes(userId) ? 'voted' : ''}`}>
                            <img src={UpArrow} alt="Upvote" />
                          </button>
                          <button onClick={() => handleDownvote(post.id)} className={`btn btn-vote ${post.downvotes.includes(userId) ? 'voted' : ''}`}>
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
    </>
  );
};

export default Home;
