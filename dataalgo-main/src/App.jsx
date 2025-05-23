import { BrowserRouter as Router, Route, Routes, useLocation} from 'react-router-dom';
//Components
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Publish from "./pages/Publish";
import Post from "./pages/Post";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import '@fortawesome/fontawesome-free/css/all.min.css';

const Routed = () => {
  const location = useLocation();
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/eduhub/" element={<><Header /><Home /><Footer/></>} />
      <Route path="/eduhub/login" element={<><Login /></>} />
      <Route path="/eduhub/signup" element={<Signup />} />
      <Route path="/eduhub/publish" element={<><Header /><Publish /></>} />
      <Route path="/eduhub/settings" element={<><Header /><Settings /></>} />
      <Route path="/eduhub/profile/:username" element={<><Header /><Profile /><Footer/></>} />
      <Route path="/eduhub/post/:postid" element={<><Header /><Post /></>} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <Routed />
    </Router>
  );
};


export default App;