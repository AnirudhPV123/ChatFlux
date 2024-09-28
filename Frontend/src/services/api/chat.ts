import apiClient from "./api";

// get other users
const getAllChats = async () => {
  return await apiClient.get("/api/v1/chat/");
};

// create a one on one chat
const createAOneOnOneChat = async (id: string) => {
  return await apiClient.post(`/api/v1/chat/c/${id}`);
};

// create a group chat
const createAGroupChat = async ({
  participants,
  groupName,
}: {
  participants: Array<string>;
  groupName: string;
}) => {
  const data = {
    participants,
    groupName,
  };
  return await apiClient.post(`/api/v1/chat/group`, data);
};

const deleteChat = async (chatId: string, userId: string) => {
  return await apiClient.delete(`/api/v1/chat/delete/${chatId}/${userId}`);
};

const leaveGroup = async (id: string) => {
  return await apiClient.put(`/api/v1/chat/leave-group/${id}`);
};

const deleteGroup = async (id: string) => {
  return await apiClient.delete(`/api/v1/chat/delete-group/${id}`);
};

const getGroupMembersDetails = async (id: string) => {
  return await apiClient.get(`/api/v1/chat/group-members-details/${id}`);
};

const removeUserFromGroup = async (groupId: string, userId: string) => {
  return await apiClient.put(
    `/api/v1/chat/remove-user-from-group/${groupId}/${userId}`,
  );
};

const addUserToGroup = async (groupId: string, userId: string) => {
  return await apiClient.put(
    `/api/v1/chat/add-user-to-group/${groupId}/${userId}`,
  );
};

const getAllCalls = async () => {
  return await apiClient.get("/api/v1/chat/calls");
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
  getAllCalls,
};
