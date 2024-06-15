import { useState, useCallback } from "react";
import { CircleX, Headphones, SendHorizontal, Video } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  sendFileMessage,
  sendGroupFileMessage,
  sendGroupMessage,
  sendMessage,
} from "../../api/message";
import toast from "react-hot-toast";
import {
  setMessages,
  setUpdateMessage,
} from "../../redux/messageSlice";
import {
  setMessageReplyDetails,
} from "../../redux/temporarySlice";
import DropUpMenu from "./DropUpMenu";
import AudioRecorderMic from "./AudioRecorder";
import { createTemporaryMessage } from "../../utils/createTemporaryMessage";

function SendInput() {
  const [message, setMessage] = useState("");
  const [isAudioRecording, setIsAudioRecording] = useState(false);

  const { selectedUser, selectedGroup, authUser,selectedChat } = useSelector(
    (store) => store.user
  );
  const { messages } = useSelector(
    (store) => store.message
  );
  const {messageReplyDetails} = useSelector(store=>store.temporary)

  const dispatch = useDispatch();

  // text or emoji send
  const handleSendMessage = useCallback(
    async (e) => {
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

      dispatch(setMessages([...messages, temporaryMessage]));
      setMessage("");

      // only run when the condition true
      // helps to reduce unwanted re-renders of code
      if (messageReplyDetails?.status) {
        dispatch(
          setMessageReplyDetails({
            replyMessageId: null,
            replyMessageUserId: null,
            status: false,
          })
        );
      }
      try {
        let res;
        if (selectedUser) {
          res = await sendMessage(
            selectedUser._id,
            message,
            messageReplyDetails?.status && messageReplyDetails
          );
        } else if (selectedGroup) {
          res = await sendGroupMessage(
            selectedGroup._id,
            message,
            messageReplyDetails?.status && messageReplyDetails
          );
        }

        if (res && res.data && res.data.data) {
          dispatch(
            setUpdateMessage({
              tempMessageId,
              newMessage: res.data.data,
            })
          );
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "An error occurred while sending the message."
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
    ]
  );

  const handleSendFile = async (blob) => {
    const formData = new FormData();
    formData.append("file", blob, "audio.webm");
    if (messageReplyDetails?.status) {
      formData.append(
        "messageReplyDetails",
        JSON.stringify(messageReplyDetails)
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

    dispatch(setMessages([...messages, temporaryMessage]));

    // only run when the condition true
    // helps to reduce unwanted re-renders of code
    if (messageReplyDetails?.status) {
      dispatch(
        setMessageReplyDetails({
          replyMessageId: null,
          replyMessageUserId: null,
          status: false,
        })
      );
    }

    try {
      let res;
      if(selectedUser){
        res = await sendFileMessage(selectedUser._id, formData);
      }
      else if (selectedGroup) {
          res = await sendGroupFileMessage(
            selectedGroup._id,
            formData
          );
        }

      if (res && res.data && res.data.data) {
        // dispatch(setMessages([...messages, res.data.data]));
        console.log("message here", res.data.data);

        dispatch(
          setUpdateMessage({ tempMessageId, newMessage: res.data.data })
        );
      }
    } catch (error) {
      dispatch(setUpdateMessage(tempMessageId, { status: "failed" }));
      toast.error(
        error.response?.data?.message ||
          "An error occurred while sending the message."
      );
    }
  };

  return (
    <div className="flex-shrink-0 border-t border-gray-600">
      {messageReplyDetails?.status && (
        <div className="w-full pr-4 pl-20 flex justify-between items-center mt-4 transition-all duration-500">
          <div className="flex gap-2">
            <div className="h-14 rounded-md overflow-hidden ">
              {messageReplyDetails?.messageToPopUp?.type === "image" ? (
                <img
                  src={messageReplyDetails?.messageToPopUp?.content}
                  alt=""
                  className="h-full  aspect-square object-cover"
                />
              ) : messageReplyDetails?.messageToPopUp?.type === "video" ? (
                <video className="h-full aspect-square object-cover">
                  <source
                    src={messageReplyDetails?.messageToPopUp?.content}
                    type={`video/${messageReplyDetails?.messageToPopUp?.format}`}
                  />
                  Your browser does not support the video tag.
                </video>
              ) : messageReplyDetails?.messageToPopUp?.type === "audio" ? (
                <div className="w-full h-full rounded-lg bg-gray-600 flex items-center justify-center">
                  <Headphones />
                </div>
              ) : (
                <div className="h-full w-full flex items-center mr-4">
                  <p>{messageReplyDetails?.messageToPopUp?.content}</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-primary font-semibold">
                {"Reply to "}
                {selectedUser?.userName}
              </p>
              <p className="text-gray-200">
                {messageReplyDetails?.messageToPopUp?.type}
              </p>
            </div>
          </div>
          <CircleX
            className="text-primary cursor-pointer"
            onClick={() =>
              dispatch(
                setMessageReplyDetails({
                  replyMessageId: null,
                  replyMessageUserId: null,
                  status: false,
                })
              )
            }
          />
        </div>
      )}{" "}
      <div id="send-input" className="h-[10vh] flex items-center gap-4 px-4">
        {/* <Paperclip /> */}
        <DropUpMenu />
        <form
          onSubmit={handleSendMessage}
          className="grow flex items-center gap-2"
        >
          <input
            type="text"
            className="grow input input-bordered border-gray-500"
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
