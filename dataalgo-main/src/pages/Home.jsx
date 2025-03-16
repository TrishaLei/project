import { useState, useEffect } from 'react';
import UserIcon from "../assets/images/user.svg";
import UpArrow from "../assets/images/arrow-big-up.svg";
import DownArrow from "../assets/images/arrow-big-down.svg";
import "../assets/styles/home.css";
import Cookies from 'js-cookie';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [LoggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/posts')
      .then(async response => {
        try {
          const data = await response.json();
          console.log(data);
          setPosts(data);
        } catch (error) {
          console.error('Error fetching posts :', error);
        }
      }).catch(error => {
        console.error('Error:', error);
      });
      Cookies.get('token') ? setLoggedIn(false) : setLoggedIn(true);
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
      ) : (
        <div className="hero">
        </div>
      )}


        <section className="posts">
          {posts.map(post => (
            console.log(post.member_count),

          <div key={post.id} className={`post ${post.isPaidContent ? 'premium' : ''}`}>
            <h2 className="post-title">{post.title}</h2>
            <p className="post-tags">Tags: {post.tags}</p>
            <p className="post-author">
              Posted by
              <span className="icon">
                <img src={UserIcon} alt="User" />
              </span>
              <span>{post.username}</span>
            </p>
            {post.isPaidContent ? (
              <>
                <p className="post-price">$5.99</p>
                <div className="post-actions">  
                  <button className="btn buy">Buy Now</button>
                </div>
              </>
              ) : (
              <div className="post-actions">
                <button className="btn btn-vote">
                  <img src={UpArrow} alt="Upvote" />
                </button>
                <button className="btn btn-vote">
                  <img src={DownArrow} alt="Downvote" />
                </button>
              </div>
              )}
            </div>
          ))}

          <div className="post">
            <h2 className="post-title">Introduction to Python Programming</h2>
            <p className="post-tags">Tags: Python, Programming, Beginners</p>
            <p className="post-author">
              Posted by
              <span className="icon">
                <img src={UserIcon} alt="User" />
              </span>
              <span>Trisha</span>
            </p>
            <div className="post-actions">
              <button className="btn btn-vote">
                <img src={UpArrow} alt="Upvote" />
              </button>
              <button className="btn btn-vote">
                <img src={DownArrow} alt="Downvote" />
              </button>
            </div> 
          </div>

          <div className="post premium">
            <h2 className="post-title">Mastering Machine Learning (Premium)</h2>
            <p className="post-tags">Tags: Machine Learning, AI</p>
            <p className="post-author">
              Posted by
              <span className="icon">
                <img src={UserIcon} alt="User" />
              </span>
              <span>Josh</span>
            </p>
            <p className="post-price">$5.99</p>
            <div className="post-actions">
              <button className="btn buy">Buy Now</button>
            </div>
          </div>

          <div className="post premium">
            <h2 className="post-title">Mastering React.js (Premium)</h2>
            <p className="post-tags">Tags: React.js, Web Development</p>
            <p className="post-author">
              Posted by
              <span className="icon">
                <img src={UserIcon} alt="User" />
              </span>
              <span>John</span>
            </p>
            <p className="post-price">$4.99</p>
            <div className="post-actions">
              <button className="btn buy">Buy Now</button>
            </div>
          </div>

          <div className="post">
            <h2 className="post-title">Introduction to Web Development</h2>
            <p className="post-tags">
              Tags: Web Development, HTML, CSS, JavaScript
            </p>
            <p className="post-author">
              Posted by
              <span className="icon">
                <img src={UserIcon} alt="User" />
              </span>
              <span>Mark</span>
            </p>
            <div className="post-actions">
              <button className="btn btn-vote">
                <img src={UpArrow} alt="Upvote" />
              </button>
              <button className="btn btn-vote">
                <img src={DownArrow} alt="Downvote" />
              </button>
            </div>
          </div>
        </section>
      </main>

      
    </>
  );
};

export default Home;
