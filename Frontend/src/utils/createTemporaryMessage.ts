// messageUtils.js

export const createTemporaryMessage = ({
  content,
  type,
  format,
  tempMessageId,
  senderId,
  messageReplyDetails,
  caption,
  conversationId,
  groupId
}) => {
  return {
    message: {
      content,
      type,
      format,
      caption,
    },
    _id: tempMessageId,
    senderId,
    ...(conversationId && { conversationId } ),
    ...(groupId && { groupId } ),
    status: "sending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...(messageReplyDetails?.status && {
      messageReplyDetails: {
        replyMessageId: messageReplyDetails?.replyMessageId,
        replyMessageUserId: messageReplyDetails?.replyMessageUserId,
        status: messageReplyDetails?.status,
      },
    }),
  };
};
