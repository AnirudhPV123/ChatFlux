import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setMessages } from "../redux/messageSlice";
import { useSocket } from "../context/SocketContext";

const useGetRealTimeMessage = () => {
  const { messages } = useSelector((store) => store.message);
  const socket = useSocket();
  const dispatch = useDispatch();

  if (!messages) {
    return;
  }

  useEffect(() => {
    socket?.on("newMessage", (newMessage) => {
      console.log("newMessage:", newMessage);
      if (messages) {
        dispatch(setMessages([...messages, newMessage]));
      } else {
        dispatch(setMessages([newMessage]));
      }
    });
    return () => socket?.off("newMessage");
  }, [messages]);
};
export default useGetRealTimeMessage;
