import apiClient from "./api";

const getMessages = async (id) => {
  return await apiClient.get(`/api/v1/message/${id}`);
};

// dynamic code for both normal message and
const sendMessage = async (id, message, messageReplyDetails) => {
  console.log("check:", message);
  if (messageReplyDetails?.messageToPopUp) {
    console.log("messagchange:", messageReplyDetails?.messageToPopUp);

    messageReplyDetails = {
      replyMessageId: messageReplyDetails.replyMessageId,
      replyMessageUserId: messageReplyDetails.replyMessageUserId,
      status: messageReplyDetails.status,
    };
    console.log("messag:");
  }

  const data = {
    message,
    ...(messageReplyDetails?.status && { messageReplyDetails }), // details for message reply
  };

  console.log("message", data);

  return await apiClient.post(`/api/v1/message/send/${id}`, data);
};

const sendGroupMessage = async (id, message, messageReplyDetails) => {
  if (messageReplyDetails?.messageToPopUp) {
    console.log("messagchange:", messageReplyDetails?.messageToPopUp);

    messageReplyDetails = {
      replyMessageId: messageReplyDetails.replyMessageId,
      replyMessageUserId: messageReplyDetails.replyMessageUserId,
      status: messageReplyDetails.status,
    };
    console.log("messag:");
  }

  const data = {
    message,
    ...(messageReplyDetails?.status && { messageReplyDetails }), // details for message reply
  };

  return await apiClient.post(`/api/v1/message/send-group/${id}`, data);
};

const getGroupMessages = async (id) => {
  return await apiClient.get(`/api/v1/message/group/${id}`);
};

const sendFileMessage = async (id, formData) => {
  console.log("hi hi hi", formData);
  console.log("file", formData);
  console.log("id", id);
  return await apiClient.post(`/api/v1/message/send/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

const sendGroupFileMessage = async (id, formData) => {
  console.log("groupFile", formData);
  return await apiClient.post(`/api/v1/message/send-group/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

const deleteMessage = async (messageId, id) => {
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
