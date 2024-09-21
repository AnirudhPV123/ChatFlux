import { useState, useCallback, FormEvent } from "react";
import { CircleX, Headphones, SendHorizontal, Video } from "lucide-react";

import {
  sendFileMessage,
  sendGroupFileMessage,
  sendGroupMessage,
  sendMessage,
} from "@/services/api/message";
import toast from "react-hot-toast";
import { setMessages, setUpdateMessage } from "@/redux/messageSlice";
import { setMessageReplyDetails } from "@/redux/temporarySlice";
import DropUpMenu from "./DropUpMenu";
import AudioRecorderMic from "./AudioRecorder";
import { createTemporaryMessage } from "@/utils/createTemporaryMessage";
import { useTypedDispatch, useTypedSelector } from "@/hooks/useRedux";

function SendInput() {
  const [message, setMessage] = useState("");
  const [isAudioRecording, setIsAudioRecording] = useState(false);

  const { selectedUser, selectedGroup, authUser, selectedChat } =
    useTypedSelector((store) => store.user);
  const { messages } = useTypedSelector((store) => store.message);
  const { messageReplyDetails } = useTypedSelector((store) => store.temporary);

  const dispatch = useTypedDispatch();

  // text or emoji send
  const handleSendMessage = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!message) {
        return;
      }

      const tempMessageId = `temp-${Date.now()}`;

      // temporary message (utils/createTemporaryMessage)
      const temporaryMessage = createTemporaryMessage({
        content: message,
        type: "text",
        format: "string",
        tempMessageId,
        senderId: authUser._id,
        messageReplyDetails,
        ...(selectedUser && {
          conversationId: selectedChat?._id,
        }),
        ...(selectedGroup && {
          groupId: selectedChat?._id,
        }),
      });

      console.log(temporaryMessage);

      console.log("messages", messages);
      // dispatch(setMessages([...messages, temporaryMessage]));
      dispatch(
        setMessages(
          messages ? [...messages, temporaryMessage] : [temporaryMessage],
        ),
      );
      setMessage("");

      // only run when the condition true
      // helps to reduce unwanted re-renders of code
      if (messageReplyDetails?.status) {
        dispatch(
          setMessageReplyDetails({
            replyMessageId: null,
            replyMessageUserId: null,
            status: false,
          }),
        );
      }
      try {
        let res;
        if (selectedUser) {
          res = await sendMessage(
            selectedUser._id,
            message,
            messageReplyDetails?.status && messageReplyDetails,
          );
        } else if (selectedGroup) {
          res = await sendGroupMessage(
            selectedGroup._id,
            message,
            messageReplyDetails?.status && messageReplyDetails,
          );
        }

        if (res && res.data && res.data.data) {
          dispatch(
            setUpdateMessage({
              tempMessageId,
              newMessage: res.data.data,
            }),
          );
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "An error occurred while sending the message.",
        );
      }
    },

    [
      message,
      selectedUser,
      selectedGroup,
      messages,
      dispatch,
      messageReplyDetails,
      authUser,
    ],
  );

  const handleSendFile = async (blob: Blob) => {
    console.log("blob:", blob);
    const formData = new FormData();
    console.log("formdata", formData);
    formData.append("file", blob, "audio.webm");
    if (messageReplyDetails?.status) {
      formData.append(
        "messageReplyDetails",
        JSON.stringify(messageReplyDetails),
      );
    }

    const tempMessageId = `temp-${Date.now()}`;

    // temporary message
    const temporaryMessage = createTemporaryMessage({
      content: URL.createObjectURL(blob),
      type: "audio",
      format: blob.type.split("/")[1],
      tempMessageId,
      senderId: authUser._id,
      messageReplyDetails,
      ...(selectedUser && {
        conversationId: selectedChat?._id,
      }),
      ...(selectedGroup && {
        groupId: selectedChat?._id,
      }),
    });

    dispatch(
      setMessages(
        messages ? [...messages, temporaryMessage] : [temporaryMessage],
      ),
    );

    // only run when the condition true
    // helps to reduce unwanted re-renders of code
    if (messageReplyDetails?.status) {
      dispatch(
        setMessageReplyDetails({
          replyMessageId: null,
          replyMessageUserId: null,
          status: false,
        }),
      );
    }

    try {
      let res;
      if (selectedUser) {
        res = await sendFileMessage(selectedUser._id, formData);
      } else if (selectedGroup) {
        res = await sendGroupFileMessage(selectedGroup._id, formData);
      }

      if (res && res.data && res.data.data) {
        // dispatch(setMessages([...messages, res.data.data]));
        console.log("message here", res.data.data);

        dispatch(
          setUpdateMessage({ tempMessageId, newMessage: res.data.data }),
        );
      }
    } catch (error: any) {
      dispatch(setUpdateMessage(tempMessageId, { status: "failed" }));
      toast.error(
        error.response?.data?.message ||
          "An error occurred while sending the message.",
      );
    }
  };

  return (
    <div className="flex-shrink-0 border-t border-gray-600">
      {messageReplyDetails?.status && (
        <div className="mt-4 flex w-full items-center justify-between pl-20 pr-4 transition-all duration-500">
          <div className="flex gap-2">
            <div className="h-14 overflow-hidden rounded-md">
              {messageReplyDetails?.messageToPopUp?.type === "image" ? (
                <img
                  src={messageReplyDetails?.messageToPopUp?.content}
                  alt=""
                  className="aspect-square h-full object-cover"
                />
              ) : messageReplyDetails?.messageToPopUp?.type === "video" ? (
                <video className="aspect-square h-full object-cover">
                  <source
                    src={messageReplyDetails?.messageToPopUp?.content}
                    type={`video/${messageReplyDetails?.messageToPopUp?.format}`}
                  />
                  Your browser does not support the video tag.
                </video>
              ) : messageReplyDetails?.messageToPopUp?.type === "audio" ? (
                <div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-600">
                  <Headphones />
                </div>
              ) : (
                <div className="mr-4 flex h-full w-full items-center">
                  <p>{messageReplyDetails?.messageToPopUp?.content}</p>
                </div>
              )}
            </div>

            <div>
              <p className="font-semibold text-primary">
                {"Reply to "}
                {selectedUser?.userName}
              </p>
              <p className="text-gray-200">
                {messageReplyDetails?.messageToPopUp?.type}
              </p>
            </div>
          </div>
          <CircleX
            className="cursor-pointer text-primary"
            onClick={() =>
              dispatch(
                setMessageReplyDetails({
                  replyMessageId: null,
                  replyMessageUserId: null,
                  status: false,
                }),
              )
            }
          />
        </div>
      )}{" "}
      {/* send message */}
      <div id="send-input" className="flex h-[10vh] items-center gap-4 px-4">
        {/* <Paperclip /> */}
        <DropUpMenu />
        <form
          onSubmit={handleSendMessage}
          className="flex grow items-center gap-2"
        >

            <input
              type="text"
              className="input input-bordered grow border-gray-500"
              placeholder="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

          <AudioRecorderMic
            isAudioRecording={isAudioRecording}
            setIsAudioRecording={setIsAudioRecording}
            handleSendFile={handleSendFile}
          />
          <button
            type="submit"
            className="flex items-center"
            onClick={() => isAudioRecording && setIsAudioRecording(false)}
          >
            <SendHorizontal />
          </button>
        </form>
      </div>
    </div>
  );
}

export default SendInput;
