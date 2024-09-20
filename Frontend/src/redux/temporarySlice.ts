import { createSlice } from "@reduxjs/toolkit";
import { ChatType } from "./chatSlice";
import { UserType } from "./userSlice";

type InitialState = {
  chatSearch: ChatType[] | [];
  groupMembers: Array<{ _id: string }> | [];
};

const initialState = {
  chatSearch: [],
  // messageReplyDetails: { status: false }, //reply message details (messageId,message owner id),
  groupMembers: null,
  // selectedChat:null
};

const temporarySlice = createSlice({
  name: "temporary",
  initialState,
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
    setGroupMembers: (state, action) => {
      state.groupMembers = action.payload;
    },
  },
});
export const { setChatSearch, setGroupMembers } = temporarySlice.actions;
export default temporarySlice.reducer;
