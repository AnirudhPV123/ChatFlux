import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword";
import AuthLayout from "./components/AuthLayout.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthLayout authentication={true}>
        <Home />
      </AuthLayout>
    ),
  },
  {
    path: "/login",
    element: (
      <AuthLayout authentication={false}>
        <Login />
      </AuthLayout>
    ),
  },
  {
    path: "/register",
    element: (
      <AuthLayout authentication={false}>
        <Register />
      </AuthLayout>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <AuthLayout authentication={false}>
        <ForgotPassword />
      </AuthLayout>
    ),
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
