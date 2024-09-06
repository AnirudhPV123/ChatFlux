import apiClient from "./api";

const loginUser = async (values) => {
  return await apiClient.post("/api/v1/users/login",values);
};

const signupUser = async (values) => {
  console.log("hipchat",values);
  const {otp:_otp,...data} = values
  console.log("submitting data",data);
  return "success"
  // return await apiClient.post("/api/v1/users/signup", data);
};

const signupVerifyOtp = async (values) => {
  console.log("otp submitted",values);
  return 'success'
  // return await apiClient.post("/api/v1/users/signup/verify-otp", values);
};

export { loginUser,signupUser,signupVerifyOtp };
