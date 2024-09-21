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
  localStorage.clear();
  window.location.href = "/login";
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { statusCode } = error.response.data || {};
    console.log("error check:", error.response.data.statusCode);

    if (statusCode === 401) {
      // Attempt to refresh the token
      const res = await api.post("/api/v1/users/refresh-token");
      console.log("res", res);
      // Retry the original request with the new token
      const originalRequest = error.config;
      return api.request(originalRequest);
    } else if (statusCode === 403) {
      handleUnauthorized();
      return Promise.reject(error);
    }
  },
);

export default api;
