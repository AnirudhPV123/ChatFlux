import React, { useMemo } from "react";
import useGetMessages from "@/hooks/message/useGetMessages";
import Message from "./Message";
import { useTypedSelector } from "@/hooks/useRedux";

function Messages() {
  useGetMessages();
  const { messages } = useTypedSelector((store) => store.message);

  const messageList = useMemo(
    () =>
      messages &&
      messages.map((message) => (
        <Message key={message?._id} message={message} />
      )),
    [messages],
  );

  // if no message return empty div
  if (!messages || messages?.length === 0) {
    return <div className="flex-grow overflow-auto p-4"></div>;
  }

  return (
    <div id="chat-messages" className="flex-grow overflow-auto p-4">
      {messageList}
    </div>
  );
}

export default Messages;
