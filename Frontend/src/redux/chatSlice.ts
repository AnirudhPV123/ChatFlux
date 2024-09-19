import { createSlice } from "@reduxjs/toolkit";

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
