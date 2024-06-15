import { createSlice } from "@reduxjs/toolkit";

const temporarySlice = createSlice({
  name: "temporary",
  initialState: {
    chatSearch: null,
    messageReplyDetails: {status:false}, //reply message details (messageId,message owner id)
    // selectedChat:null
  },
  reducers: {
    setChatSearch: (state, action) => {
      state.chatSearch = action.payload;
    },
    setMessageReplyDetails: (state, action) => {
      state.messageReplyDetails = action.payload;
    },
    // setSelectedChat:(state,action)=>{
    //   state.selectedChat=action.payload
    // }
  },
});
export const { setChatSearch, setMessageReplyDetails } =
  temporarySlice.actions;
export default temporarySlice.reducer;
