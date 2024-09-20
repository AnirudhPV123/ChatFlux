import axios from "axios";
// /**
//  * API interceptors to handle token expiration:
//  * - Checks if the access token is expired.
//  * - If expired, attempts to refresh the token and re-calls the original request.
//  * - If token refresh fails, redirects to the login page.
//  */
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URI,
  withCredentials: true,
  timeout: 120000,
});

const handleUnauthorized = () => {
  window.location.href = "/login";
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { status } = error.response || {};

    if (status === 401) {
      try {
        // Attempt to refresh the token
        await api.post("/api/v1/users/refresh-token");

        // Retry the original request with the new token
        const originalRequest = error.config;
        return api.request(originalRequest);
      } catch (refreshError) {
        // Handle token refresh failure
        handleUnauthorized();
        return Promise.reject(refreshError);
      }
    }

    //     // handle other errors
    handleUnauthorized();
    return Promise.reject(error);
  },
);

export default api;
