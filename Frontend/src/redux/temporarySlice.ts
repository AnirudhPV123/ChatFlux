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
  bottomBarIsCall: boolean;
};

const initialState: InitialState = {
  chatSearch: [],
  messageReplyDetails: null, //reply message details (messageId,message owner id),
  groupMembers: null,
  bottomBarIsCall: false,
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
    setGroupMembers: (state, action) => {
      state.groupMembers = action.payload;
    },
    setBottomBarIsCall: (state, action) => {
      state.bottomBarIsCall = action.payload
    },
    resetTemporarySlice: (state) => {
      state.chatSearch = [];
      state.messageReplyDetails = null;
      state.groupMembers = null;
      state.bottomBarIsCall = false
    },
  },
});
export const {
  setChatSearch,
  setGroupMembers,
  setMessageReplyDetails,
  resetTemporarySlice,
  setBottomBarIsCall
} = temporarySlice.actions;
export default temporarySlice.reducer;
