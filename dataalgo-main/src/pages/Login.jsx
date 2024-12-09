import { Link } from "react-router-dom";
import "../assets/styles/signup.css";

const Login = () => {
  return (
    <>
      <header className="header">
        <div className="logo">EduHub</div>
        <nav className="nav">
          <Link to="/login" className="btn login active">
            Login
          </Link>
          <Link to="/signup" className="btn signup">
            Sign Up
          </Link>
        </nav>
      </header>

      <main className="content">
        <section className="form-container">
          <h2>Login</h2>
          <form action="/login" method="POST" className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username or Email</label>
              <input
                type="text"
                id="username"
                name="username"
                required
                placeholder="Enter your username or email"
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
            <button type="submit" className="btn submit-btn">
              Login
            </button>
          </form>
          <p className="form-footer">
            Don&apos;t have an account? <Link to="/signup">Sign up here</Link>.
          </p>
        </section>
      </main>

      <footer className="footer">
        <p>EduHub &copy; 2024. All rights reserved.</p>
      </footer>
    </>
  );
};

export default Login;
