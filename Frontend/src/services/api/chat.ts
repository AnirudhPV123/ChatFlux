import apiClient from "./api";

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

const deleteChat = async (chatId, userId) => {
  return await apiClient.delete(`/api/v1/chat/delete/${chatId}/${userId}`);
  // const data = { chatId, userId };
// TODO: for sometime need userId to send notification
  // return await apiClient.delete(`/api/v1/chat/delete/`, data);
};

const leaveGroup = async (id) => {
  return await apiClient.put(`/api/v1/chat/leave-group/${id}`);
};

const deleteGroup = async (id) => {
  return await apiClient.delete(`/api/v1/chat/delete-group/${id}`);
};

const getGroupMembersDetails = async (id) => {
  return await apiClient.get(`/api/v1/chat/group-members-details/${id}`);
};

const removeUserFromGroup = async (groupId, userId) => {
  return await apiClient.put(
    `/api/v1/chat/remove-user-from-group/${groupId}/${userId}`,
  );
};

const addUserToGroup = async (groupId, userId) => {
  return await apiClient.put(
    `/api/v1/chat/add-user-to-group/${groupId}/${userId}`,
  );
};

export {
  getAllChats,
  createAOneOnOneChat,
  createAGroupChat,
  deleteChat,
  leaveGroup,
  deleteGroup,
  getGroupMembersDetails,
  removeUserFromGroup,
  addUserToGroup,
};
