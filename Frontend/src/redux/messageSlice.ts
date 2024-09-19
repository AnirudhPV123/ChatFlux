import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
  name: "message",
  initialState: {
    messages: null,
  },
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    setResetMessagesState: (state) => {
      state.messages = null;
    },

    // when sending message temporary message is created so when response , update temporary message except senderId(already present) and message object(if we update message object the frontend message file message load by cloudinary url and blank space show for some time)
    setUpdateMessage(state, action) {
      const { tempMessageId, newMessage } = action.payload;
      const index = state.messages.findIndex(
        (message) => message._id === tempMessageId,
      );
      if (index !== -1) {
        state.messages[index] = {
          ...state.messages[index],
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
      }
    },
    setDeleteMessage(state, action) {
      const { messageId } = action.payload;
      const index = state.messages.findIndex(
        (message) => message._id === messageId,
      );
      if (index !== -1) {
        state.messages[index] = {
          ...state.messages[index],
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
