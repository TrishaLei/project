import { useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import { Alert } from 'antd';
import SignupStyle from "../assets/styles/signup.module.css";
import FormStyle from "../assets/styles/form.module.css";
import { SetCookie } from '../components/auth/cookies.jsx';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [alertVisible, setAlertVisible] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setAlert({ type: 'error', message: 'Passwords do not match.' });
      setAlertVisible(true);
      setTimeout(() => {
        setAlertVisible(false);
      }, 3000);
      return;
    }

    const JoinDate = new Date().toISOString();

    try {
      const response = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, JoinDate }),
      });

      if (response.ok) {
        const usertoken = Math.floor(Math.random() * 100000000000);
        const data = await response.json();
        const cookieData = {
          id: data.id,
          username: username,
          token: usertoken
        };
        SetCookie('data', cookieData, { 
          expires: 7, 
          secure: true, 
          sameSite: 'Strict' 
        });
        navigate('/');
      } else {
        const errorData = await response.json();
        setAlert({ type: 'error', message: errorData.message || 'Signup failed. Please try again.' });
      }
      setAlertVisible(true);
      setTimeout(() => {
        setAlertVisible(false);
      }, 3000);
    } catch (error) {
      console.error('Error:', error);
      setAlert({ type: 'error', message: 'Server error. Please try again later.' });
      setAlertVisible(true);
      setTimeout(() => {
        setAlertVisible(false);
      }, 3000);
    }
  };

  return (
    <>
      <div className={`${SignupStyle.Alert} ${alertVisible ? SignupStyle.AlertVisible : SignupStyle.AlertHidden}`}>
        {alert.message && (
          <Alert
            message={alert.message}
            type={alert.type}
            showIcon
            onClose={() => setAlert({ type: '', message: '' })}
          />
        )}
      </div>
      <main className={SignupStyle.Wrapper}>
        <h2>Eduhub</h2>
        <section className={FormStyle.LoginSignupFormContainer}>
          <h2>Sign up</h2>
          <form onSubmit={handleSubmit}>
            <div className={FormStyle.FormGroup}>
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                required
                placeholder="Enter your username or email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className={FormStyle.FormGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className={FormStyle.FormGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className={FormStyle.FormGroup}>
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                type="password"
                id="confirm-password"
                name="confirm-password"
                required
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button type="submit" className={FormStyle.SubmitBtn}>
              Sign Up
            </button>
          </form>
          <p className={FormStyle.FormFooter}>
            Already have an account? <Link to="/login">Login here</Link>.
          </p>
        </section>
        <footer className={SignupStyle.Footer}>
            <p><Link to="/">EduHub</Link> &copy; 2024. All rights reserved.</p>
        </footer>
      </main>
    </>
  );
};

export default Signup;
