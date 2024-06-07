import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import useGetMessages from "../../hooks/useGetMessages";
import useGetRealTimeMessage from "../../hooks/useGetRealTimeMessage";
import Message from "./Message";
import { setMessages } from "../../redux/messageSlice";
import { useSocket } from "../../context/SocketContext";
import { setChats } from "../../redux/chatSlice";

function Messages() {
  useGetMessages();
  // useGetRealTimeMessage();

  const { messages } = useSelector((store) => store.message);
  const { authUser } = useSelector((store) => store.user);


  const dispatch = useDispatch();

  // later
  const socket = useSocket();

  const messageList = useMemo(
    () =>
      messages &&
      messages.map((message) => (
        // <div>message</div>
        <Message key={message?._id} message={message} />
      )),
    [messages]
  );

  if (!messages || messages?.length === 0) {
    return <div className="p-4 h-[80vh]"></div>;
  }



  // later
  // if (
  //   messages.some(
  //     (message) =>
  //       message.status === "sent" && message.senderId !== authUser._id
  //   )
  // ) {
  //   dispatch(
  //     setMessages((prev) =>
  //       prev.map((message) =>
  //         message.status === "sent"
  //           ? { ...message, status: "delivered" }
  //           : message
  //       )
  //     )
  //   );

  //   socket.emit("newDeliveredChange");
  // }

  return (
    <div id="chat-messages" className="h-[80vh] overflow-auto p-4">
      {messageList}
    </div>
  );
}

export default Messages;
