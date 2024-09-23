import { createSlice } from "@reduxjs/toolkit";
import { ChatType } from "./chatSlice";
import { UserType } from "./userSlice";

type InitialState = {
  chatSearch: ChatType[] | [];
  groupMembers: {
    _id: string;
    groupAdmin: string;
    membersDetails: UserType[];
  } | null;
  messageReplyDetails: {
    status: boolean;
  };
};

const initialState: InitialState = {
  chatSearch: [],
  messageReplyDetails: { status: false }, //reply message details (messageId,message owner id),
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
    setMessageReplyDetails: (state, action) => {
      state.messageReplyDetails = action.payload;
    },
    // setSelectedChat:(state,action)=>{
    //   state.selectedChat=action.payload
    // }
    setGroupMembers: (state, action) => {
      state.groupMembers = action.payload;
    },
    resetTemporarySlice: (state) => {
      state.chatSearch = [];
      state.messageReplyDetails = { status: false };
      state.groupMembers = null;
    },
  },
});
export const {
  setChatSearch,
  setGroupMembers,
  setMessageReplyDetails,
  resetTemporarySlice,
} = temporarySlice.actions;
export default temporarySlice.reducer;
