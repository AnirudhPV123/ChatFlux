import { combineReducers, configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice.ts";
import storage from "redux-persist/lib/storage";
import chatReducer from "./chatSlice.ts";
import temporarySlice from "./temporarySlice.ts";
import messageReducer from "./messageSlice.ts";

import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

const persistConfig = {
  key: "chat-app",
  storage,
  version: 1,
  blacklist: ["temporary"],
};

const rootReducer = combineReducers({
  user: userReducer,
  chat: chatReducer,
  temporary: temporarySlice,
  message: messageReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Define RootState and AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
