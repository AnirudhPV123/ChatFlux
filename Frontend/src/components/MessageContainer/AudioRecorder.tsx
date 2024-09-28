import useOrderChatWhenMessage from "@/hooks/chat/useOrderChatWhenMessage";
import { useTypedDispatch, useTypedSelector } from "@/hooks/useRedux";
import { setMessages, setUpdateMessage } from "@/redux/messageSlice";
import { setMessageReplyDetails } from "@/redux/temporarySlice";
import { sendFileMessage, sendGroupFileMessage } from "@/services/api/message";
import CustomError from "@/types/CustomErrorType";
import { createTemporaryMessage } from "@/utils/createTemporaryMessage";
import { memo, useCallback, useEffect } from "react";
import { AudioRecorder, useAudioRecorder } from "react-audio-voice-recorder";
import toast from "react-hot-toast";

type AudioRecorderMicProps = {
  setIsAudioRecording: React.Dispatch<React.SetStateAction<boolean>>;
  isAudioRecording: boolean;
};

function AudioRecorderMic({
  setIsAudioRecording,
  isAudioRecording,
}: AudioRecorderMicProps) {
  const recorderControls = useAudioRecorder();

  const { selectedUser, selectedGroup, authUser, selectedChat } =
    useTypedSelector((store) => store.user);
  const { messages } = useTypedSelector((store) => store.message);
  const { messageReplyDetails } = useTypedSelector((store) => store.temporary);
  const dispatch = useTypedDispatch();
  const updateChats = useOrderChatWhenMessage();

  const addAudioElement = () => {
    recorderControls.stopRecording();
  };

  useEffect(() => {
    if (recorderControls.isRecording) {
      setIsAudioRecording(true);
    }
  }, [recorderControls.isRecording, setIsAudioRecording]);

  const handleSendFile = useCallback(
    async (blob: Blob) => {
      const formData = new FormData();

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

      updateChats();

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
          dispatch(
            setUpdateMessage({ tempMessageId, newMessage: res.data.data }),
          );
        }
      } catch (error) {
        const customError = error as CustomError;
        dispatch(setUpdateMessage({ tempMessageId, status: "failed" }));
        toast.error(
          customError.response?.data?.message ||
            "An error occurred while sending the message.",
        );
      }
    },
    [
      authUser,
      selectedUser,
      selectedGroup,
      selectedChat,
      messageReplyDetails,
      messages,
      dispatch,
    ],
  );

  useEffect(() => {
    if (!isAudioRecording) {
      recorderControls.stopRecording();
      if (recorderControls.recordingBlob)
        handleSendFile(recorderControls.recordingBlob);
      setIsAudioRecording(false);
    }
  }, [isAudioRecording]);

  return (
    <div className="mr-2 flex items-center gap-2">
      <AudioRecorder
        onRecordingComplete={addAudioElement}
        audioTrackConstraints={{
          noiseSuppression: true,
          echoCancellation: true,
        }}
        downloadFileExtension="webm"
        recorderControls={recorderControls}
        showVisualizer={true}
      />
    </div>
  );
}

export default memo(AudioRecorderMic);
