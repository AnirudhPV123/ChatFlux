import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type UserType = {
  username: string;
  email: string;
};

type UserSlice = {
  authUser: UserType | null;
  isAuthUser: boolean;
};

const initialState: UserSlice = {
  authUser: null,
  isAuthUser: false,
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
  },
});
export const { setUserSlice, clearUserSlice } = userSlice.actions;
export default userSlice.reducer;
