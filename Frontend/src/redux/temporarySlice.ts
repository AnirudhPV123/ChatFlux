import { createSlice } from "@reduxjs/toolkit";

const temporarySlice = createSlice({
  name: "temporary",
  initialState: {
    chatSearch: [],
    // messageReplyDetails: { status: false }, //reply message details (messageId,message owner id),
    // groupMembers: null,
    // selectedChat:null
  },
  reducers: {
    setChatSearch: (state, action) => {
      state.chatSearch = action.payload;
    },
    // setMessageReplyDetails: (state, action) => {
    //   state.messageReplyDetails = action.payload;
    // },
    // setSelectedChat:(state,action)=>{
    //   state.selectedChat=action.payload
    // }
    // setGroupMembers: (state, action) => {
    //   state.groupMembers = action.payload;
    // },
  },
});
export const { setChatSearch } = temporarySlice.actions;
export default temporarySlice.reducer;
