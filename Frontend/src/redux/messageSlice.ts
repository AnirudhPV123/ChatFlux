import { createSlice } from "@reduxjs/toolkit";

export type Message = {
  _id: string;
  senderId: string;
  receiverId: string;
  message: {
    content: string;
    type: string;
    format: string;
    caption: string;
  } | null;
  conversationId: string;
  groupId: string;
  status: string;
  notification: [string];
  messageReplyDetails: {
    replyMessageId: string;
    replyMessageUserId: string;
    status: boolean;
  } | null;
  senderDetails: {
    _id: string;
    avatar: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
};

const initialState: { messages: Message[] | null } = {
  messages: null,
};

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    setResetMessagesState: (state) => {
      state.messages = null;
    },

    // when sending message temporary message is created so when response , update temporary message except senderId(already present) and message object(if we update message object the frontend message file message load by cloudinary url and blank space show for some time)
    setUpdateMessage(state, action) {
      const { tempMessageId, newMessage, status } = action.payload;
      const index = state.messages?.findIndex(
        (message) => message._id === tempMessageId,
      ) as number;
      if (index !== -1) {
        if (status !== "failed") {
          state.messages![index] = {
            ...state.messages![index],
            _id: newMessage._id,
            receiverId: newMessage.receiverId,
            ...(newMessage?.conversationId && {
              conversationId: newMessage.conversationId,
            }),
            ...(newMessage?.groupId && {
              groupId: newMessage.groupId,
            }),

            status: newMessage.status,
            notifications: newMessage?.notifications,
            messageReplyDetails: newMessage?.messageReplyDetails,
          };
        } else {
          state.messages![index] = {
            ...state.messages![index],
            status: "failed",
          };
        }
      }
    },
    setDeleteMessage(state, action) {
      const { messageId } = action.payload;
      const index = state.messages?.findIndex(
        (message) => message._id === messageId,
      );
      if (index !== -1) {
        state.messages![index as number] = {
          ...state.messages![index as number],
          messageReplyDetails: null,
          message: null,
        };
      }
    },
  },
});
export const {
  setMessages,
  setResetMessagesState,
  setUpdateMessage,
  setDeleteMessage,
} = messageSlice.actions;
export default messageSlice.reducer;
