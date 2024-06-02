import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import moment from "moment";

function Message({ message }) {
  const scroll = useRef();

  const { authUser, selectedUser, selectedGroup } = useSelector(
    (store) => store.user
  );

  let sender = false;
  if (authUser?._id === message?.senderId) {
    sender = true;
  }

  useEffect(() => {
    scroll.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  const normalTime = moment(message?.updatedAt).format("H:mm a") || "";

  return (
    <div ref={scroll} className={`chat ${sender ? "chat-start" : "chat-end"} `}>
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          {/* dynamic avatar setup */}
          <img
            alt="Tailwind CSS chat bubble component"
            src={
              sender
                ? authUser?.avatar
                : selectedUser
                ? selectedUser?.avatar
                : message?.senderDetails?.avatar
            }
          />
        </div>
      </div>
      <div className="chat-header">
        <time className="text-xs opacity-50">{normalTime}</time>
      </div>
      <div className={`chat-bubble ${sender && "bg-[#747FFF] text-white"}`}>
        {message?.message}
      </div>
      <div className="chat-footer opacity-50">Delivered</div>
    </div>
  );
}

export default Message;
