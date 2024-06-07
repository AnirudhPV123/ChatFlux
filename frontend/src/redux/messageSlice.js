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
      state.messages = null
    }
  },
});
export const { setMessages,setResetMessagesState } = messageSlice.actions;
export default messageSlice.reducer;
