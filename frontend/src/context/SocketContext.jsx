// SocketContext.js
import React, { createContext, useContext, useState } from "react";
import { useSelector } from "react-redux";
import io from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { authUser } = useSelector((store) => store.user);

  React.useEffect(() => {
    if (authUser) {
      const socketio = io(`${import.meta.env.VITE_SERVER_URI}`, {
        transports: ["websocket"],

        query: {
          userId: authUser._id,
        },
      });

      setSocket(socketio);

      return () => {
        socketio.disconnect();
      };
    } else {
      if (socket) {
        socket.close();
      }
    }
  }, [authUser]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
