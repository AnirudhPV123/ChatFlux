import { createSlice } from "@reduxjs/toolkit";
import { UserType } from "./userSlice";

export type ChatType = {
  _id: string;
  isGroupChat: boolean;
  participants: UserType[];
  groupName: string;
  lastMessageTime: string;
  notification: number;
  avatar?: string;
  username?: string;
  groupAdmin?: string;
};

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chats: [],
  },
  reducers: {
    setChats: (state, action) => {
      state.chats = action.payload;
    },
    setResetChatsState: (state) => {
      state.chats = [];
    },
  },
});
export const { setChats, setResetChatsState } = chatSlice.actions;
export default chatSlice.reducer;
