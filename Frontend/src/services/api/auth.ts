import { AuthResponse } from "@/hooks/auth/types";
import apiClient from "./api";

import {
  ForgotPasswordInitialValues,
  LoginInitialValues,
  SignUpInitialValues,
} from "@/components/auth/types";
import convertToISODate from "@/utils/convertToISODate";

const loginUser = async (values: LoginInitialValues): Promise<AuthResponse> => {
  return await apiClient.post("/api/v1/users/login", values);
};

const signupUser = async (
  values: SignUpInitialValues,
): Promise<AuthResponse> => {
  const data = {
    username: values.username,
    email: values.email,
    password: values.password,
    dateOfBirth: convertToISODate(values.dateOfBirth),
    gender: values.gender,
  };
  return await apiClient.post("/api/v1/users/signup", data);
};

const signupVerifyOtp = async (
  values: SignUpInitialValues,
): Promise<AuthResponse> => {
  const data = {
    otp: values.otp,
    email: values.email,
  };
  return await apiClient.post("/api/v1/users/signup/verify-otp", data);
};

const forgotPasswordVerifyEmail = async (
  values: ForgotPasswordInitialValues,
): Promise<AuthResponse> => {
  const data = {
    email: values.email,
  };
  return await apiClient.post("/api/v1/users/forgot-password", data);
};

const forgotPasswordVerifyOtp = async (
  values: ForgotPasswordInitialValues,
): Promise<AuthResponse> => {
  const data = {
    otp: values.otp,
    email: values.email,
  };
  return await apiClient.post("/api/v1/users/forgot-password/verify-otp", data);
};

const resetPassword = async (
  values: ForgotPasswordInitialValues,
): Promise<AuthResponse> => {
  const data = {
    email: values.email,
    password: values.password,
  };
  return await apiClient.post("/api/v1/users/forgot-password/reset", data);
};

export {
  loginUser,
  signupUser,
  signupVerifyOtp,
  forgotPasswordVerifyEmail,
  forgotPasswordVerifyOtp,
  resetPassword,
};
