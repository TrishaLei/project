import { useState, useEffect } from 'react';
import UserIcon from "../assets/images/user.svg";
import UpArrow from "../assets/images/arrow-big-up.svg";
import DownArrow from "../assets/images/arrow-big-down.svg";
import "../assets/styles/home.css";
import { GetCookie } from '../components/auth/cookies.jsx';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [LoggedIn, setLoggedIn] = useState(false);

  const handleUpvote = () => {

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

    GetCookie('data') ? setLoggedIn(false) : setLoggedIn(true);

    const ws = new WebSocket('ws://localhost:5000/');
    ws.onmessage = (event) => {
      const newPost = JSON.parse(event.data);
      setPosts(prevPosts => [newPost, ...prevPosts]);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
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
                    <img src={"http://localhost:5000/avatar/1"} alt="User" />
                  </span>
                  <span>{post.username}</span>
                </p>
                {(() => {
                  switch (post.contentType) {
                    case 1:
                      return (
                        <div className="post-actions">  
                          <button className="btn buy">Subscribe</button>
                        </div>
                      );
                    case 2:
                      return (
                        <>
                          <p className="post-price">${post.price.toFixed(2)}</p>
                          <div className="post-actions">  
                            <button className="btn buy">Buy Now</button>
                          </div>
                        </>
                      );
                    default:
                      return (
                        <div className="post-actions">
                          <button onClick={handleUpvote} className="btn btn-vote">
                            <img src={UpArrow} alt="Upvote" />
                          </button>
                          <button className="btn btn-vote">
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
