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
    replyMessageId: boolean;
    replyMessageUserId: string;
    senderUsername: string;
    status: boolean;
    messageToPopUp: {
      content: string;
      type: string;
      format: string;
    };
  } | null;
};

const initialState: InitialState = {
  chatSearch: [],
  messageReplyDetails: null, //reply message details (messageId,message owner id),
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
      state.messageReplyDetails = null;
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
