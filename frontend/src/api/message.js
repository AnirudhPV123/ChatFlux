import axios from "axios";

// Create an Axios instance for API requests
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URI,
  withCredentials: true,
  timeout: 120000,
});

const getMessages = async (id) => {
  return await apiClient.get(`/api/v1/message/${id}`);
};

const sendMessage = async (id, message) => {
  const data = {
    message,
  };

  return await apiClient.post(`/api/v1/message/send/${id}`, data);
};


const sendGroupMessage = async (id, message) => {
  const data = {
    message,
  };

  return await apiClient.post(`/api/v1/message/send-group/${id}`, data);
};

const getGroupMessages = async (id) => {
  return await apiClient.get(`/api/v1/message/group/${id}`);
};


export { getMessages, sendMessage ,sendGroupMessage ,getGroupMessages };
