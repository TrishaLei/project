import { useState } from "react";
import { Link } from "react-router-dom";
import "../assets/styles/post.css";

const Post = () => {
  const [isPaid, setIsPaid] = useState(false);

  const handlePaidChange = () => {
    setIsPaid(!isPaid);
  };

  return (
    <>
      <header className="header">
        <div className="logo">EduHub</div>
        <nav className="nav">
          <Link to="/" className="btn">
            Home
          </Link>
          <Link to="/profile" className="btn">
            Profile
          </Link>
        </nav>
      </header>

      <main className="content">
        <div className="form-container">
          <h2>Create a New Post</h2>
          <form id="postForm">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                placeholder="Enter post title"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="tags">Tags</label>
              <input
                type="text"
                id="tags"
                name="tags"
                placeholder="Enter tags separated by commas"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="attachments">Attachments</label>
              <input type="file" id="attachments" name="attachments" multiple />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                placeholder="Write your post description here..."
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="isPaid">Access</label>
              <input
                type="checkbox"
                id="isPaid"
                name="isPaid"
                onChange={handlePaidChange}
              />
              <label htmlFor="isPaid">Paid Content</label>
              {isPaid && (
                <div id="priceInput" className="price-input">
                  <label htmlFor="price">Set Price ($)</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    placeholder="Enter price"
                    step="0.01"
                    min="0"
                  />
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="submit">Publish Post</button>
            </div>
          </form>
        </div>
      </main>

      <footer className="footer">
        <p>EduHub &copy; 2024. All rights reserved.</p>
      </footer>
    </>
  );
};

export default Post;
