import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store } from "./redux/store.ts";
import persistStore from "redux-persist/es/persistStore";
import { Toaster } from "react-hot-toast";
import { SocketProvider } from "./context/SocketContext.tsx";

const persistor = persistStore(store);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SocketProvider>
          <App />
        </SocketProvider>
      </PersistGate>
      <Toaster />
    </Provider>
  </StrictMode>,
);
