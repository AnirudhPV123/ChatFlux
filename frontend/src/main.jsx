import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Toaster } from "react-hot-toast";
import { PersistGate } from "redux-persist/integration/react";
import store from "./redux/store.js";
import { persistStore } from "redux-persist";
import { Provider } from "react-redux";
import { SocketProvider } from "./context/SocketContext.jsx";

let persistor = persistStore(store);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SocketProvider>
          <App />
        </SocketProvider>
      </PersistGate>
      <Toaster />
    </Provider>
  </React.StrictMode>
);
