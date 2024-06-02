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
    phoneNumber: "+91" + values.phoneNumber.toString(),
    otp: values.otp,
    password: values.password,
    confirmPassword: values.confirmPassword,
    gender: values.gender,
  };
  return await apiClient.post("/api/v1/users/register", data);
};

const verifyOTP = async ({ otp, phoneNumber }) => {
  const data = {
    phoneNumber: "+91" + phoneNumber.toString(),
    otp,
  };
  return await apiClient.post("/api/v1/users/verify", data);
};

const loginUser = async (values) => {
  const data = {
    phoneNumber: "+91" + values.phoneNumber.toString(),
    password: values.password,
  };
  return await apiClient.post("/api/v1/users/login", data);
};

const logoutUser = async () => {
  return await apiClient.get("/api/v1/users/logout");
};

const forgotPassword = async ({ phoneNumber }) => {
  console.log("forgot");
  const data = { phoneNumber: "+91" + phoneNumber.toString() };
  return await apiClient.post("/api/v1/users/forgot-password", data);
};

const resetPasswordVerifyOTP = async ({ phoneNumber, otp }) => {
  const data = { phoneNumber: "+91" + phoneNumber.toString(), otp };
  return await apiClient.post("/api/v1/users/reset-password", data);
};

const resetPasswordNewPassword = async (values) => {
  const data = {
    phoneNumber: "+91" + values.phoneNumber.toString(),
    newPassword: values.newPassword,
    confirmPassword: values.confirmPassword,
  };
  console.log(data);
  return await apiClient.post("/api/v1/users/reset-password", data);
};

const resendOTP = async (phoneNumber) => {
  console.log("phon :", phoneNumber);
  const data = {
    phoneNumber: "+91" + phoneNumber.toString(),
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
