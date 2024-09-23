import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

import moment from "moment";
import {
  ChevronDown,
  EllipsisVertical,
  MessageCircleOff,
  MessageCircleReply,
  Trash2,
} from "lucide-react";
import { setMessageReplyDetails } from "@/redux/temporarySlice";
import { deleteMessage } from "@/services/api/message";
import { setDeleteMessage } from "@/redux/messageSlice";
import { useTypedDispatch, useTypedSelector } from "@/hooks/useRedux";

function Message({ message }) {
  const [messageType, setMessageType] = useState("");
  const [messageFormat, setMessageFormat] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [isSender, setIsSender] = useState(false);

  const [replyMessageDetails, setReplyMessageDetails] = useState(null);
  const [isReplyMessage, setIsReplyMessage] = useState(false);
  const [replyGroupMessageSender, setReplyGroupMessageSender] = useState(null);

  const { authUser, selectedUser, selectedGroup } = useTypedSelector(
    (store) => store.user,
  );
  const { messages } = useTypedSelector((store) => store.message);

  const scroll = useRef();
  const dispatch = useTypedDispatch();

  useLayoutEffect(() => {
    // dynamically set changes based on isSender
    if (authUser?._id === message?.senderId) setIsSender(true);
    else setIsSender(false);

    // set message details
    setMessageType(message?.message?.type);
    setMessageFormat(message?.message?.format);
    setMessageContent(message?.message?.content);

    // if this is a reply message than set reply message details
    // find message from messages array by using replyMessageId
    if (message?.messageReplyDetails) {
      const originalMessage = messages.find(
        (msg) => msg._id === message?.messageReplyDetails?.replyMessageId,
      );

      if (!originalMessage) return;

      if (selectedGroup) {
        setReplyGroupMessageSender(originalMessage?.senderDetails);
      }

      setReplyMessageDetails(originalMessage);
      setIsReplyMessage(true);
      console.log("original message", originalMessage);
    }
  }, [message, messages, isSender, authUser, selectedGroup]);

  useEffect(() => {
    scroll.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  const normalTime = moment(message?.updatedAt).format("H:mm a") || "";

  return (
    <div
      ref={scroll}
      className={`chat ${
        authUser?._id === message?.senderId
          ? "chat-start"
          : authUser?._id !== message?.senderId && "chat-end"
      } mb-2`}
    >
      <div className="avatar chat-image w-8">
        <div className="w-10 rounded-full">
          {/* dynamic avatar setup */}
          <img
            alt="Tailwind CSS chat bubble component"
            src={
              isSender
                ? authUser?.avatar
                : selectedUser
                  ? selectedUser?.avatar
                  : message?.senderDetails?.avatar
            }
          />
        </div>
      </div>
      <div
        className={`chat-bubble w-fit min-w-[20%] max-w-[80%] lg:max-w-[60%] ${
          isSender && "bg-[#7a85ff] px-2 text-white"
        }`}
      >
        <div className="chat-header mb-2 flex w-full justify-between">
          <p className="text-sm font-bold">
            {isSender
              ? "You"
              : selectedUser
                ? selectedUser?.username
                : selectedGroup && message?.senderDetails?.username}
          </p>
          <div className="flex items-center gap-4">
            <time className="text-xs opacity-50">{normalTime}</time>

            <div className="flex gap-2">
              {messageContent && message?.senderId === authUser?._id && (
                <Trash2
                  strokeWidth={3}
                  size={20}
                  className="cursor-pointer"
                  onClick={async () => {
                    dispatch(setDeleteMessage({ messageId: message?._id }));
                    await deleteMessage(
                      message?._id,
                      selectedUser ? selectedUser?._id : selectedGroup?._id,
                    );
                  }}
                />
              )}
              <MessageCircleReply
                strokeWidth={3}
                size={20}
                onClick={() => {
                  message?.status !== "sending" &&
                    dispatch(
                      setMessageReplyDetails({
                        replyMessageId: message?._id,
                        replyMessageUserId: message.senderId,
                        status: true,
                        messageToPopUp: message?.message,
                        senderUsername: isSender
                          ? "You"
                          : selectedUser
                            ? selectedUser?.username
                            : selectedGroup && message?.senderDetails?.username,
                      }),
                    );
                }}
                className="cursor-pointer"
              />
            </div>
          </div>
        </div>
        {replyMessageDetails && (
          // {replyMessageDetails?.message?.content && (
          <div
            className={`rounded-lg p-2 ${
              !isSender ? "bg-gray-800" : "bg-[#5f69da]"
            }`}
          >
            <p
              className={`font-semibold ${
                isSender ? "text-[#000000]" : "text-gray-300"
              }`}
            >
              {selectedUser &&
              replyMessageDetails?.senderId === selectedUser?._id
                ? selectedUser?.username
                : selectedGroup && replyGroupMessageSender
                  ? replyGroupMessageSender?.username
                  : "You"}
            </p>
            {replyMessageDetails?.message?.content && (
              <div>
                {isReplyMessage &&
                  replyMessageDetails?.message.type === "text" && (
                    <p>{replyMessageDetails?.message?.content}</p>
                  )}
                {isReplyMessage &&
                  replyMessageDetails?.message.type === "image" && (
                    <img
                      src={replyMessageDetails?.message?.content}
                      alt=""
                      className="w-1/2"
                    />
                  )}{" "}
                {isReplyMessage &&
                  replyMessageDetails?.message.type === "video" && (
                    <video className="w-1/2">
                      <source
                        src={replyMessageDetails?.message?.content}
                        type={`video/${replyMessageDetails?.message?.format}`}
                      />
                      Your browser does not support the video tag.
                    </video>
                  )}
                {isReplyMessage &&
                  replyMessageDetails?.message.type === "audio" && (
                    <audio>
                      <source
                        src={replyMessageDetails?.message?.content}
                        type={`audio/${replyMessageDetails?.message?.format}`}
                      />
                    </audio>
                  )}
              </div>
            )}
            {isReplyMessage && !replyMessageDetails?.message && (
              <div className="flex gap-2 opacity-60">
                <MessageCircleOff />
                <p> This message was deleted</p>
              </div>
            )}
          </div>
        )}
        <div
          className={`${
            isSender && message?.message?.caption
              ? "bg-[#5e69e6]"
              : !isSender && message?.message?.caption
                ? "bg-gray-800"
                : "py-0"
          } overflow-hidden rounded-lg p-2`}
        >
          {messageType === "text" ? (
            <h2>{messageContent}</h2>
          ) : messageType === "image" ? (
            <img src={messageContent}></img>
          ) : messageType === "video" ? (
            <video controls>
              <source src={messageContent} type={`video/${messageFormat}`} />
              Your browser does not support the video tag.
            </video>
          ) : messageType === "audio" ? (
            <audio controls className={`${replyMessageDetails && "mt-2"}`}>
              <source src={messageContent} type={`audio/${messageFormat}`} />
              Your browser does not support the video tag.
            </audio>
          ) : (
            <div className="flex gap-2 opacity-60">
              <MessageCircleOff />
              <p> This message was deleted</p>
            </div>
          )}
          {message?.message?.caption && (
            <div className="px-1 pb-2">
              {" "}
              <p>{message?.message?.caption}</p>
            </div>
          )}
        </div>
      </div>
      {authUser?._id !== message?.receiverId && (
        <div className="chat-footer opacity-50">{message?.status}</div>
      )}
    </div>
  );
}

export default Message;
