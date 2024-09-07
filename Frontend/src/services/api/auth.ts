import apiClient from "./api";
import {
  LoginInitialValues,
  SignUpInitialValues,
} from "@/components/auth/types";

const loginUser = async (values: LoginInitialValues) => {
  console.log("login user", values);
  return
  // return await apiClient.post("/api/v1/users/login", values);
};

const signupUser = async (values: SignUpInitialValues) => {
  const data = {
    username: values.username,
    email: values.email,
    password: values.password,
    dateOfBirth: `${values.dateOfBirth.year}-${values.dateOfBirth.month}-${values.dateOfBirth.day}`,
    gender: values.gender,
  };
  console.log("signup user", data);
  return
  // return await apiClient.post("/api/v1/users/signup", data);
};

const signupVerifyOtp = async (values: SignUpInitialValues) => {
  const data = {
    otp: values.otp,
    email: values.email,
  };
  console.log("verify otp", data);
  return
  // return await apiClient.post("/api/v1/users/signup/verify-otp", data);
};

const forgotPasswordVerifyEmail = async (values: SignUpInitialValues) => {
  const data = {
    email: values.email,
  };
  console.log("verify email", data);
  return
  
  // return await apiClient.post("/api/v1/users/forgot-password", data);
};

const forgotPasswordVerifyOtp = async (values: SignUpInitialValues) => {
  const data = {
    otp: values.otp,
    email: values.email,
  };
  console.log("verify otp", data);
  return
  // return await apiClient.post("/api/v1/users/forgot-password/verify-otp", data);
};

const resetPassword = async (values: SignUpInitialValues) => {
  const data = {
    email: values.email,
    password: values.password,
  };

  console.log("reset password", data);
  return
  // return await apiClient.post("/api/v1/users/reset-password", data);
};

export {
  loginUser,
  signupUser,
  signupVerifyOtp,
  forgotPasswordVerifyEmail,
  forgotPasswordVerifyOtp,
  resetPassword
};
