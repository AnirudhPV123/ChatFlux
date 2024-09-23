// messageUtils.js
type CreateTemporaryMessageProps = {
  content: any;
  type: string;
  format: string;
  tempMessageId: string;
  senderId: string;
  messageReplyDetails?: any;
  caption?: string;
  conversationId?: string;
  groupId?: string;
};

export const createTemporaryMessage = ({
  content,
  type,
  format,
  tempMessageId,
  senderId,
  messageReplyDetails,
  caption,
  conversationId,
  groupId,
}: CreateTemporaryMessageProps) => {
  return {
    message: {
      content,
      type,
      format,
      caption,
    },
    _id: tempMessageId,
    senderId,
    ...(conversationId && { conversationId }),
    ...(groupId && { groupId }),
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
