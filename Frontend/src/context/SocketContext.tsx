import { useTypedSelector } from "@/hooks/useRedux";
import { Socket } from "socket.io-client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import io from "socket.io-client";

type SocketContextType = Socket | null;

const SocketContext = createContext<SocketContextType>(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<SocketContextType>(null);
  const { authUser } = useTypedSelector((store) => store.user);

  useEffect(() => {
    if (!authUser) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        return;
      }
    }

    const socketio = io(`${import.meta.env.VITE_BACKEND_URI}`, {
      transports: ["websocket"],
      query: {
        userId: authUser?._id,
      },
    });

    setSocket(socketio);

    return () => {
      socketio.disconnect();
    };
  }, [authUser]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
