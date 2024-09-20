import { useEffect } from "react";
import { ChatType, setChats } from "@/redux/chatSlice";
import { useSocket } from "@/context/SocketContext";
import { useTypedDispatch, useTypedSelector } from "../useRedux";

const useGetRealTimeChat = () => {
  const { chats } = useTypedSelector((store) => store.chat);
  const dispatch = useTypedDispatch();
  const socket = useSocket();

  useEffect(() => {
    const handleNewChat = (newChat: ChatType) => {
      if (chats) {
        dispatch(setChats([...chats, newChat]));
      } else {
        dispatch(setChats(newChat));
      }
    };

    if (socket) {
      socket.on("new-chat", handleNewChat);
    }

    return () => {
      if (socket) {
        socket.off("new-chat", handleNewChat);
      }
    };
  }, [dispatch, socket, chats]);
};

export default useGetRealTimeChat;
