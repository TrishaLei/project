import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Foryoupage from "./pages/Foryoupage";
import Post from "./pages/Post";

const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/signup",
      element: <Signup />,
    },
    {
      path: "/foryoupage",
      element: <Foryoupage />,
    },
    {
      path: "/post",
      element: <Post />,
    },
  ]);

  return <RouterProvider router={router} />;
};

export default App;
