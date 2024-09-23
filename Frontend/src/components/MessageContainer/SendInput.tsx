import { useState, useCallback, FormEvent } from "react";
import { SendHorizontal } from "lucide-react";

import { sendGroupMessage, sendMessage } from "@/services/api/message";
import toast from "react-hot-toast";
import { setMessages, setUpdateMessage } from "@/redux/messageSlice";
import { setMessageReplyDetails } from "@/redux/temporarySlice";
import DropUpMenu from "./DropUpMenu";
import AudioRecorderMic from "./AudioRecorder";
import { createTemporaryMessage } from "@/utils/createTemporaryMessage";
import { useTypedDispatch, useTypedSelector } from "@/hooks/useRedux";
import CustomError from "@/types/CustomErrorType";
import MessageReplyDetails from "./MessageReplyDetails";

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
        senderId: authUser?._id as string,
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
        const customError = error as CustomError;
        toast.error(
          customError.response?.data?.message ||
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
      selectedChat,
    ],
  );

  return (
    <div className="flex-shrink-0 border-t border-gray-600">
      {/* reply popup bar */}
      <MessageReplyDetails />
      <div id="send-input" className="flex h-[10vh] items-center gap-4 px-4">
        {/* file upload and camera */}
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

          {/* audio recorder */}
          <AudioRecorderMic
            isAudioRecording={isAudioRecording}
            setIsAudioRecording={setIsAudioRecording}
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
