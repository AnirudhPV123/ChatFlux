import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setChats } from "../redux/chatSlice";
import { useSocket } from "../context/SocketContext";

const useGetRealTimeChat = () => {
  const { chats } = useSelector((store) => store.chat);
  const socket = useSocket();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleNewChat = (newChat) => {
      if (chats) {
        dispatch(setChats([...chats, newChat]));
      } else {
        dispatch(setChats(newChat));
      }
    };

    if (socket) {
      socket.on("newChat", handleNewChat);
    }


    return () => {
      if (socket) {
        socket.off("newChat", handleNewChat);
      }
    };
  }, [dispatch, socket, chats]);
};

export default useGetRealTimeChat;
