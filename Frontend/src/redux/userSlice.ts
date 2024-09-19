import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type UserType = {
  _id: string;
  username: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  _v: number;
  createdAt: string;
  updatedAt: string;
};

type UserSlice = {
  authUser: UserType | null;
  isAuthUser: boolean;
  selectedUser: Array<{ _id: string }> | null;
  onlineUsers: Array<{ _id: string }> | null;
  availableUsers: Array<{ _id: string }> | null;
  selectedGroup: { groupId: string } | null;
  selectedChat: { chatId: string } | null;
};

const initialState: UserSlice = {
  authUser: null,
  isAuthUser: false,
  selectedUser: null,
  selectedGroup: null,
  onlineUsers: null,
  availableUsers: null,
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
    },

    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
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
