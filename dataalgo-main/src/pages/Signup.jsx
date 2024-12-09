import { Link } from "react-router-dom";

const Signup = () => {
  return (
    <>
      <header className="header">
        <div className="logo">EduHub</div>
        <nav className="nav">
          <Link to="/login" className="btn login">
            Login
          </Link>
          <Link to="/signup" className="btn signup active">
            Sign Up
          </Link>
        </nav>
      </header>

      <main className="content">
        <section className="form-container">
          <h2>Sign Up</h2>
          <form action="/signup" method="POST" className="signup-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                required
                placeholder="Enter your username"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="Enter your email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                placeholder="Enter your password"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                type="password"
                id="confirm-password"
                name="confirm-password"
                required
                placeholder="Confirm your password"
              />
            </div>
            <button type="submit" className="btn submit-btn">
              Sign Up
            </button>
          </form>
          <p className="form-footer">
            Already have an account? <Link to="/login">Login here</Link>.
          </p>
        </section>
      </main>

      <footer className="footer">
        <p>EduHub &copy; 2024. All rights reserved.</p>
      </footer>
    </>
  );
};

export default Signup;
