import apiClient from "./api";

const loginUser = async (values) => {
  return await apiClient.post("/api/v1/users/login",values);
};

const signupUser = async (values) => {
  return await apiClient.post("/api/v1/users/login", values);
};

export { loginUser,signupUser };
