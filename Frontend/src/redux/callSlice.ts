import { createSlice } from "@reduxjs/toolkit";

export type CallType = {
  _id: string;
  callerId: string;
  attenderId: string;
  isAttend: boolean;
  isVideo: boolean;
  conversationId: string;
  createdAt: string;
};

const callSlice = createSlice({
  name: "call",
  initialState: {
    calls: [],
  },
  reducers: {
    setCalls: (state, action) => {
      state.calls = action.payload;
    },
    setResetCallState: (state) => {
      state.calls = [];
    },
  },
});
export const { setCalls, setResetCallState } = callSlice.actions;
export default callSlice.reducer;
