import { useState } from "react";
import { Link } from "react-router-dom";
import "../assets/styles/foryoupage.css";

const Foryoupage = () => {
  const [searchBarVisible, setSearchBarVisible] = useState(false);
  const previousSearches = [
    "Python",
    "Machine Learning",
    "Data Science",
    "Cloud Computing",
    "AI Basics",
  ];

  const handleCreateSearch = () => {
    setSearchBarVisible(true);
  };

  const handleCloseSearch = () => {
    setSearchBarVisible(false);
  };

  return (
    <>
      <header className="header">
        <div className="logo">EduHub</div>
        <nav className="nav">
          <Link to="/user_profile">
            <img
              src="profile_picture.jpg"
              alt="Your Profile"
              className="small-profile-pic"
            />
          </Link>
          <Link to="/settings" className="btn">
            Post
          </Link>
          <Link to="/settings" className="btn">
            Settings
          </Link>
          <Link to="/chat" className="btn">
            Chat
          </Link>
          <Link to="/logout" className="btn logout">
            Logout
          </Link>
        </nav>
      </header>

      <main className="content">
        <section className="search-section">
          <div className="search-container">
            <button
              id="createSearchBtn"
              className="btn"
              onClick={handleCreateSearch}
            >
              Add Search Bar
            </button>
            <button id="closeBtn" className="btn" onClick={handleCloseSearch}>
              Close
            </button>
          </div>
          <div id="dynamicSearchContainer">
            {searchBarVisible && (
              <>
                <input
                  type="text"
                  className="search-bar"
                  placeholder="Search topics, tags, or users..."
                />
                <select className="dropdown">
                  <option value="">Previous Searches</option>
                  {previousSearches.map((search) => (
                    <option key={search} value={search}>
                      {search}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        </section>

        <section className="post-feed">
          <div className="post-card">
            <div className="post-header">
              <Link to="/user_profile" className="profile-link">
                <img
                  src="user1_picture.jpg"
                  alt="User 1 Profile"
                  className="post-profile-pic"
                />
                <span className="post-username">User123</span>
              </Link>
              <span className="post-time">2 hours ago</span>
            </div>
            <div className="post-content">
              <h3 className="post-title">Introduction to Python</h3>
              <p className="post-snippet">
                Learn the basics of Python programming with this comprehensive
                guide. Includes exercises and examples.
              </p>
              <Link to="/post_details" className="btn">
                Read More
              </Link>
              <div className="post-actions">
                <button className="btn upvote">Upvote</button>
                <button className="btn downvote">Downvote</button>
              </div>
            </div>
          </div>

          <div className="post-card">
            <div className="post-header">
              <Link to="/user_profile" className="profile-link">
                <img
                  src="user2_picture.jpg"
                  alt="User 2 Profile"
                  className="post-profile-pic"
                />
                <span className="post-username">JaneDoe</span>
              </Link>
              <span className="post-time">5 hours ago</span>
            </div>
            <div className="post-content">
              <h3 className="post-title">Understanding Machine Learning</h3>
              <p className="post-snippet">
                This article explores the foundations of machine learning and
                its real-world applications.
              </p>
              <Link to="/post_details" className="btn">
                Read More
              </Link>
              <div className="post-actions">
                <button className="btn upvote">Upvote</button>
                <button className="btn downvote">Downvote</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>EduHub &copy; 2024. All rights reserved.</p>
      </footer>
    </>
  );
};

export default Foryoupage;
