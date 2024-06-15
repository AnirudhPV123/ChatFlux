import { combineReducers, configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice.js";
import messageReducer from "./messageSlice.js";
import chatReducer from "./chatSlice.js";
import temporarySlice from "./temporarySlice.js";
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  blacklist: ["temporary"], // Add temporarySlice to the blacklist
};

const rootReducer = combineReducers({
  user: userReducer,
  message: messageReducer,
  chat: chatReducer,
  temporary: temporarySlice, // Add temporarySlice to rootReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});
export default store;
