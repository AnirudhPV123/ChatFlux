import apiClient from "./api";

// get available users
const getAvailableUsers = async () => {
  return await apiClient.get("/api/v1/users/users");
};

export { getAvailableUsers };
