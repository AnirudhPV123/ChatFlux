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
        <Message key={message?._id} message={message} />
      )),
    [messages]
  );

  // if no message return empty div
  if (!messages || messages?.length === 0) {
    return <div className="overflow-auto p-4 flex-grow"></div>;
  }

  return (
    <div id="chat-messages" className="overflow-auto p-4 flex-grow">
      {messageList}
    </div>
  );
}

export default Messages;
