import apiClient from "./api";

const getMessages = async (id: string) => {
  return await apiClient.get(`/api/v1/message/${id}`);
};

// dynamic code for both normal message and
const sendMessage = async (
  id: string,
  message: string,
  messageReplyDetails: any,
) => {
  if (messageReplyDetails?.messageToPopUp) {
    messageReplyDetails = {
      replyMessageId: messageReplyDetails.replyMessageId,
      replyMessageUserId: messageReplyDetails.replyMessageUserId,
      status: messageReplyDetails.status,
    };
  }

  const data = {
    message,
    ...(messageReplyDetails?.status && { messageReplyDetails }), // details for message reply
  };

  return await apiClient.post(`/api/v1/message/send/${id}`, data);
};

const sendGroupMessage = async (
  id: string,
  message: string,
  messageReplyDetails: any,
) => {
  if (messageReplyDetails?.messageToPopUp) {
    messageReplyDetails = {
      replyMessageId: messageReplyDetails.replyMessageId,
      replyMessageUserId: messageReplyDetails.replyMessageUserId,
      status: messageReplyDetails.status,
    };
  }

  const data = {
    message,
    ...(messageReplyDetails?.status && { messageReplyDetails }), // details for message reply
  };

  return await apiClient.post(`/api/v1/message/send-group/${id}`, data);
};

const getGroupMessages = async (id: string) => {
  return await apiClient.get(`/api/v1/message/group/${id}`);
};

const sendFileMessage = async (id: string, formData: FormData) => {
  return await apiClient.post(`/api/v1/message/send/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

const sendGroupFileMessage = async (id: string, formData: FormData) => {
  return await apiClient.post(`/api/v1/message/send-group/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

const deleteMessage = async (messageId: string, id: string) => {
  return await apiClient.put(
    `/api/v1/message/delete-message/${messageId}/${id}`,
  );
};

export {
  getMessages,
  sendMessage,
  sendGroupMessage,
  getGroupMessages,
  sendFileMessage,
  sendGroupFileMessage,
  deleteMessage,
};
