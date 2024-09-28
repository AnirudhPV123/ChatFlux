import {
  LegacyRef,
  memo,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import moment from "moment";
import { MessageCircleOff, MessageCircleReply, Trash2 } from "lucide-react";
import { setMessageReplyDetails } from "@/redux/temporarySlice";
import { deleteMessage } from "@/services/api/message";
import { setDeleteMessage } from "@/redux/messageSlice";
import { useTypedDispatch, useTypedSelector } from "@/hooks/useRedux";
import type { Message } from "@/redux/messageSlice";

function Message({ message }: { message: Message }) {
  const [messageContent, setMessageContent] = useState("");
  const [isSender, setIsSender] = useState(false);

  const [replyMessageDetails, setReplyMessageDetails] =
    useState<Message | null>(null);
  const [replyGroupMessageSender, setReplyGroupMessageSender] = useState<{
    _id: string;
    avatar: string;
    username: string;
  } | null>(null);

  const { authUser, selectedUser, selectedGroup } = useTypedSelector(
    (store) => store.user,
  );
  const { messages } = useTypedSelector((store) => store.message);

  const scroll = useRef<HTMLElement>(null);
  const dispatch = useTypedDispatch();

  useLayoutEffect(() => {
    // dynamically set changes based on isSender
    if (authUser?._id === message?.senderId) setIsSender(true);
    else setIsSender(false);

    setMessageContent(message?.message?.content);

    // if this is a reply message than set reply message details
    // find message from messages array by using replyMessageId
    if (message?.messageReplyDetails) {
      const originalMessage = messages?.find(
        (msg) => msg._id === message?.messageReplyDetails?.replyMessageId,
      );

      if (!originalMessage) return;

      if (selectedGroup) {
        setReplyGroupMessageSender(originalMessage?.senderDetails);
      }

      setReplyMessageDetails(originalMessage);
    }
  }, [message, messages, isSender, authUser, selectedGroup]);

  useEffect(() => {
    scroll.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  const normalTime = moment(message?.updatedAt).format("H:mm a") || "";

  const renderMediaContent = (messageType: string) => {
    const dynamicMessage =
      messageType === "replyMessageDetails" ? replyMessageDetails : message;
    switch (dynamicMessage?.message?.type) {
      case "text":
        return <p>{dynamicMessage?.message?.content}</p>;
      case "image":
        return <img src={dynamicMessage?.message?.content} alt="" />;
      case "video":
        return (
          <video controls>
            <source
              src={dynamicMessage.message.content}
              type={`video/${dynamicMessage.message.format}`}
            />
            Your browser does not support the video tag.
          </video>
        );
      case "audio":
        return (
          <audio controls>
            <source
              src={dynamicMessage.message.content}
              type={`audio/${dynamicMessage.message.format}`}
            />
          </audio>
        );
    }

    return (
      <div className="flex gap-2 opacity-60">
        <MessageCircleOff />
        <p> This message was deleted</p>
      </div>
    );
  };

  return (
    <div
      ref={scroll as LegacyRef<HTMLDivElement>}
      className={`chat ${isSender ? "chat-start" : "chat-end"} mb-2`}
    >
      <div className="avatar chat-image w-8">
        <div className="w-10 rounded-full">
          {/* dynamic avatar setup */}
          <img
            alt="Avatar"
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
        className={`chat-bubble w-fit max-w-[30rem] ${
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
              {messageContent && isSender && (
                <Trash2
                  strokeWidth={3}
                  size={20}
                  className="cursor-pointer text-red-500"
                  onClick={async () => {
                    dispatch(setDeleteMessage({ messageId: message?._id }));
                    await deleteMessage(
                      message?._id,
                      selectedUser ? selectedUser?._id : selectedGroup?._id as string,
                    );
                  }}
                />
              )}
              <MessageCircleReply
                strokeWidth={3}
                size={20}
                onClick={() => {
                  if (message?.status !== "sending") {
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
                  }
                }}
                className="cursor-pointer"
              />
            </div>
          </div>
        </div>

        {replyMessageDetails && (
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
            {replyMessageDetails?.message?.content &&
              renderMediaContent("replyMessageDetails")}
          </div>
        )}
        {renderMediaContent("message")}
        {message?.message?.caption && (
          <div className="px-1 pb-2">
            {" "}
            <p>{message?.message?.caption}</p>
          </div>
        )}
      </div>
      {authUser?._id !== message?.receiverId && (
        <div className="chat-footer opacity-50">{message?.status}</div>
      )}
    </div>
  );
}

export default memo(Message);
