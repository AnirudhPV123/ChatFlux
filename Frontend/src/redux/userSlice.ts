import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatType } from "./chatSlice";

export type UserType = {
  _id: string;
  username: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  _v: number;
  createdAt: string;
  updatedAt: string;
  avatar: string;
  // isGroupChat: boolean;
  // participants:[]
  // groupName:string
};

type UserSlice = {
  authUser: UserType | null;
  isAuthUser: boolean;
  onlineUsers: string[] | [];
  availableUsers: UserType[] | [];
  selectedUser: ChatType | null;
  selectedGroup: ChatType | null;
  selectedChat: ChatType | null;
};

const initialState: UserSlice = {
  authUser: null,
  isAuthUser: false,
  selectedUser: null,
  selectedGroup: null,
  onlineUsers: [],
  availableUsers: [],
  selectedChat: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserSlice: (state, action: PayloadAction<UserType>) => {
      state.authUser = action.payload;
      state.isAuthUser = true;
    },
    clearUserSlice: (state) => {
      state.authUser = null;
      state.isAuthUser = false;
      state.selectedUser = null;
      state.selectedGroup = null;
      state.onlineUsers = [];
      state.availableUsers = [];
      state.selectedChat = null;
    },

    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
      // state.onlineUsers.push(action.payload);
    },
    setAvailableUsers: (state, action) => {
      state.availableUsers = action.payload;
    },
    setSelectedGroup: (state, action) => {
      state.selectedGroup = action.payload;
    },
    setSelectedChat: (state, action) => {
      state.selectedChat = action.payload;
    },
  },
});
export const {
  setUserSlice,
  clearUserSlice,
  setSelectedGroup,
  setSelectedChat,
  setSelectedUser,
  setAvailableUsers,
  setOnlineUsers,
} = userSlice.actions;
export default userSlice.reducer;
