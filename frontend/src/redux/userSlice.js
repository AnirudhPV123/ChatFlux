import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    authStatus: false,
    authUser: null,
    selectedUser: null,
    onlineUsers: null,
    availableUsers: null,
    selectedGroup: null,
    selectedChat:null
  },
  reducers: {
    setAuthUser: (state, action) => {
      state.authUser = action.payload;
      state.authStatus = action.payload?.isActive || false;
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
    setResetUserState: (state, action) => {
      (state.authStatus = false),
        (state.authUser = null),
        (state.selectedUser = null),
        (state.onlineUsers = null),
        (state.availableUsers = null),
        (state.selectedGroup = null);
    },
    setSelectedChat: (state, action) => {
      state.selectedChat = action.payload;
    },
  },
});
export const {
  setAuthUser,
  setSelectedUser,
  setOnlineUsers,
  setAvailableUsers,
  setSelectedGroup,
  setResetUserState,
  setSelectedChat
} = userSlice.actions;
export default userSlice.reducer;
