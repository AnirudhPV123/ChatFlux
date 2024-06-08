import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import useGetMessages from "../../hooks/useGetMessages";
import Message from "./Message";

function Messages() {
  useGetMessages();

  const { messages } = useSelector((store) => store.message);

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

  return (
    <div
      id="chat-messages"
      className="h-[80vh] overflow-auto p-4"
    >
      {messageList}
    </div>
  );
}

export default Messages;
