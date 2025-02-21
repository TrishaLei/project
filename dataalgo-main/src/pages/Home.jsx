import { Link } from "react-router-dom";
import UserIcon from "../assets/images/user.svg";
import UpArrow from "../assets/images/arrow-big-up.svg";
import DownArrow from "../assets/images/arrow-big-down.svg";
import "../assets/styles/home.css";

const Home = () => {
  return (
    <>
      <main className="content">
        <section className="hero">
          <h1>Welcome to EduHub!</h1>
          <p>
            Your go-to platform for sharing and discovering educational
            resources.
          </p>
        </section>

        <section className="posts">
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
