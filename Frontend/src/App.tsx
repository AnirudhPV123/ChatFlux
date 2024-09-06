import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PageLayout from "./layout/PageLayout";
import ProtectedRoute from "./layout/ProtectedRoute";
import { LoginPage, SignupPage, ForgotPasswordPage } from "@/pages";
import "@/assets/styles/global.css";

import {
  createBrowserRouter,
  RouterProvider,
  RouteObject,
} from "react-router-dom";

// Define a type for your routes
type AppRoute = RouteObject & {
  authentication: boolean;
};

function App() {
  const routes: AppRoute[] = [
    { path: "/login", element: <LoginPage />, authentication: false },
    { path: "signup", element: <SignupPage />, authentication: false },
    {
      path: "/forgot-password",
      element: <ForgotPasswordPage />,
      authentication: false,
    },
  ];

  const queryClient = new QueryClient();

  const router = createBrowserRouter(
    routes.map(({ path, element, authentication }) => ({
      path,
      element: (
        <PageLayout>
          <ProtectedRoute authentication={authentication}>
            <QueryClientProvider client={queryClient}>
              {element}
            </QueryClientProvider>
          </ProtectedRoute>
        </PageLayout>
      ),
    })),
  );
  return <RouterProvider router={router} />;
}

export default App;
