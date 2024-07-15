import axios from "axios";

// Create an Axios instance for API requests
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URI,
  withCredentials: true,
  timeout: 120000,
});

const registerUser = async (values) => {
  const data = {
    userName: values.userName,
    email: values.email,
    otp: values.otp,
    password: values.password,
    confirmPassword: values.confirmPassword,
    gender: values.gender,
  };
  return await apiClient.post("/api/v1/users/register", data);
};

const verifyOTP = async ({ otp, email }) => {
  const data = {
    email: email.toString(),
    otp,
  };
  return await apiClient.post("/api/v1/users/verify", data);
};

const loginUser = async (values) => {
  const data = {
    email: values.email.toString(),
    password: values.password,
  };
  return await apiClient.post("/api/v1/users/login", data);
};

const logoutUser = async () => {
  return await apiClient.get("/api/v1/users/logout");
};

const forgotPassword = async ({ email }) => {
  console.log("forgot");
  const data = { email};
  return await apiClient.post("/api/v1/users/forgot-password", data);
};

const resetPasswordVerifyOTP = async ({ email, otp }) => {
  const data = { email, otp };
  return await apiClient.post("/api/v1/users/reset-password", data);
};

const resetPasswordNewPassword = async (values) => {
  const data = {
    email:   values.email.toString(),
    newPassword: values.newPassword,
    confirmPassword: values.confirmPassword,
  };
  console.log(data);
  return await apiClient.post("/api/v1/users/reset-password", data);
};

const resendOTP = async (email) => {
  console.log("phon :", email);
  const data = {
    email:  email.toString(),
  };
  console.log(data);
  return await apiClient.post("/api/v1/users/resend-otp", data);
};

const getUser = async () => {
  return await apiClient.get("/api/v1/users/profile");
};

const refreshToken = async () => {
  return await apiClient.post("/api/v1/users/refresh-token");
};

// get other users
const getOtherUsers = async () => {
  return await apiClient.get("/api/v1/users/other-users");
};

// get available users
const getAvailableUsers = async () => {
  return await apiClient.get("/api/v1/users/users");
};

export {
  registerUser,
  verifyOTP,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPasswordVerifyOTP,
  resetPasswordNewPassword,
  resendOTP,
  getOtherUsers, //get other users
  getUser,
  refreshToken,
  getAvailableUsers,
};
