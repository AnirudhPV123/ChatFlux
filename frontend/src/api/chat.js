import axios from "axios";

// Create an Axios instance for API requests
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URI,
  withCredentials: true,
  timeout: 120000,
});


// get other users
const getAllChats = async () => {
  return await apiClient.get("/api/v1/chat/");
};

// create a one on one chat
const createAOneOnOneChat = async (id) => {
  return await apiClient.post(`/api/v1/chat/c/${id}`);
};

// create a group chat
const createAGroupChat = async ({ participants, groupName }) => {
  const data = {
    participants,
    groupName,
  };
  return await apiClient.post(`/api/v1/chat/group`, data);
};

export {
  getAllChats,
  createAOneOnOneChat,
  createAGroupChat,
};
