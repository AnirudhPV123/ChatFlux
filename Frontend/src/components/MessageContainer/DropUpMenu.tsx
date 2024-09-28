import {
  CircleX,
  Camera,
  FolderClosed,
  Images,
  Paperclip,
  SendHorizontal,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { sendFileMessage, sendGroupFileMessage } from "@/services/api/message";
import { setMessages, setUpdateMessage } from "@/redux/messageSlice";
import CameraCapture from "./Camera";
import { createTemporaryMessage } from "@/utils/createTemporaryMessage";
import { useTypedDispatch, useTypedSelector } from "@/hooks/useRedux";
import CustomError from "@/types/CustomErrorType";
import useOrderChatWhenMessage from "@/hooks/chat/useOrderChatWhenMessage";

const DropUpMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [isCamera, setIsCamera] = useState(false);

  const [capturedVideo, setCapturedVideo] = useState<File | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  const autoCloseDropMenuRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const photoAndVideoInputRef = useRef<HTMLInputElement | null>(null);

  const { selectedGroup, selectedUser, authUser, selectedChat } =
    useTypedSelector((store) => store.user);
  const { messageReplyDetails } = useTypedSelector((store) => store.temporary);
  const { messages } = useTypedSelector((store) => store.message);

  const dispatch = useTypedDispatch();
  const updateChats = useOrderChatWhenMessage();

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const handleFileInputClick = (
    inputRef: React.RefObject<HTMLInputElement>,
  ) => {
    inputRef.current?.click();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        autoCloseDropMenuRef.current &&
        !autoCloseDropMenuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const base64ToBlob = (base64: string, mimeType: string) => {
    const byteCharacters = atob(base64.split(",")[1]);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: mimeType });
  };

  const handleSendFile = useCallback(async () => {
    const formData = new FormData();

    let cameraPhotoFile;
    // Check if file is in base64 format
    if (
      capturedPhoto &&
      typeof capturedPhoto === "string" &&
      capturedPhoto.startsWith("data:")
    ) {
      const mimeType = capturedPhoto.match(/data:(.*);base64,/)?.[1] || "";
      cameraPhotoFile = base64ToBlob(capturedPhoto, mimeType);
      formData.append("file", cameraPhotoFile, "image.jpeg"); // Change the name as needed
    } else if (capturedVideo) {
      formData.append("file", capturedVideo, "video.webm");
    } else if (file) {
      formData.append("file", file);
    }

    formData.append("caption", caption);

    const tempMessageId = `temp-${Date.now()}`;

    // temporary message (utils/createTemporaryMessage)
    // temporary message
    const temporaryMessage = createTemporaryMessage({
      content: URL.createObjectURL(
        (capturedPhoto
          ? cameraPhotoFile
          : capturedVideo
            ? capturedVideo
            : file) as Blob, // Ensure type
      ),
      type: capturedPhoto
        ? "image"
        : capturedVideo
          ? "video"
          : (file?.type.split("/")[0] as string),
      format:
        capturedPhoto || capturedVideo
          ? "webm"
          : (file?.type.split("/")[1] as string),
      tempMessageId,
      senderId: authUser?._id as string,
      caption,
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
    setFile(null);
    setIsOpen(false);
    setCaption("");
    setCapturedPhoto(null);
    setCapturedVideo(null);

    try {
      const res = selectedUser
        ? await sendFileMessage(selectedUser?._id, formData)
        : await sendGroupFileMessage(selectedGroup?._id, formData);

      if (res?.data?.data) {
        dispatch(
          setUpdateMessage({ tempMessageId, newMessage: res.data.data }),
        );
      }
    } catch (error) {
      const customError = error as CustomError;
      toast.error(
        customError.response?.data?.message ||
          "An error occurred while sending the message.",
      );
    }
  }, [
    file,
    selectedUser,
    caption,
    capturedPhoto,
    capturedVideo,
    dispatch,
    messages,
    authUser,
    selectedChat,
    selectedGroup,
  ]);

  const renderFilePreview = () => {
    if (!file) {
      return null; // No file selected, render nothing
    }

    const fileType = file.type.split("/")[0]; // Extract file type (image, video, audio)

    switch (fileType) {
      case "image":
        return <img src={URL.createObjectURL(file)} alt="Image Preview" />;
      case "video":
        return <video controls src={URL.createObjectURL(file)} />;
      case "audio":
        return (
          <audio
            className="custom-audio w-full"
            controls
            src={URL.createObjectURL(file)}
          />
        );
      default:
        return <p>File type not supported</p>;
    }
  };

  const truncateFileName = (fileName: string) => {
    const maxLength = 20; // Maximum length of file path
    if (fileName.length <= maxLength) return fileName;

    const truncatedLength = Math.floor((maxLength - 6) / 2); // Leave space for the ellipsis and some part of the file name
    const fileNameWithoutExtension = fileName.split(".").slice(0, -1).join(".");
    const extension = fileName.split(".").pop();
    const beginningPart = fileNameWithoutExtension.substring(
      0,
      truncatedLength,
    );
    const endingPart = fileNameWithoutExtension.substring(
      fileNameWithoutExtension.length - truncatedLength,
    );
    const truncatedName = `${beginningPart}...${endingPart}.${extension}`;
    return truncatedName;
  };

  return (
    <>
      <div className="relative" ref={autoCloseDropMenuRef}>
        <button
          onClick={toggleMenu}
          className="flex items-center justify-center rounded-full bg-gray-800 p-2 text-white focus:outline-none"
          disabled={messageReplyDetails?.status}
        >
          <Paperclip />
        </button>
        <div
          className={`duration-50 absolute bottom-full left-0 mb-2 w-48 overflow-hidden rounded-lg border border-gray-500 bg-[#1D232A] px-2 shadow-lg transition-all ${
            isOpen ? `max-h-60 py-2 opacity-100` : `max-h-0 py-0 opacity-0`
          } `}
        >
          <ul className="flex flex-col">
            <li
              className="flex cursor-pointer items-center rounded-md p-2 hover:bg-gray-700"
              onClick={() => handleFileInputClick(fileInputRef)}
            >
              <FolderClosed
                strokeWidth={3}
                className="mr-3 h-5 w-5 rounded text-blue-500"
              />
              <span>File</span>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={(e) => setFile(e.target?.files?.[0] || null)}
              />
            </li>
            <li
              className="flex cursor-pointer items-center rounded-md p-2 hover:bg-gray-700"
              onClick={() => handleFileInputClick(photoAndVideoInputRef)}
            >
              <Images
                strokeWidth={3}
                className="mr-3 h-5 w-5 rounded text-green-500"
              />
              <span>Photos & Videos</span>
              <input
                type="file"
                accept="video/*,image/*" // Accept both video and image files
                ref={photoAndVideoInputRef}
                style={{ display: "none" }}
                onChange={(e) => setFile(e.target?.files?.[0] || null)}
              />
            </li>
            <li
              className="flex cursor-pointer items-center rounded-md p-2 hover:bg-gray-700"
              onClick={() => setIsCamera(true)}
            >
              <Camera
                strokeWidth={3}
                className="mr-3 h-5 w-5 rounded text-orange-500"
              />
              <span>Camera</span>
            </li>
          </ul>
        </div>
      </div>
      {/* show preview */}
      {file && (
        <div className="absolute left-0 top-0 z-20 h-full w-full backdrop-blur-sm">
          <div className="absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 rounded-lg border border-gray-400 bg-[#1D232A] p-4">
            <div className="mb-4 flex justify-end">
              <CircleX
                size={25}
                className="cursor-pointer text-primary"
                onClick={() => setFile(null)}
              />
            </div>
            <div className="mb-2 flex justify-between">
              <p title={file.name} className="file-name text-gray-200">
                {truncateFileName(file.name)}
              </p>
              <p className="text-sm">
                {Math.round(file.size / 1024) < 1024
                  ? Math.round(file.size / 1024) + " KB"
                  : Math.round(file.size / (1024 * 1024)) + " MB"}
              </p>
            </div>
            {renderFilePreview()}{" "}
            <div className="mt-6 flex items-center justify-between gap-2">
              <input
                type="text"
                className="input input-bordered grow border-gray-500"
                placeholder="Add a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />

              <SendHorizontal
                size={25}
                className="cursor-pointer text-primary"
                onClick={handleSendFile}
              />
            </div>
          </div>
        </div>
      )}
      {isCamera && (
        <CameraCapture
          isCamera={isCamera}
          setIsCamera={setIsCamera}
          capturedPhoto={capturedPhoto as string}
          setCapturedPhoto={setCapturedPhoto}
          capturedVideo={capturedVideo as File}
          setCapturedVideo={setCapturedVideo}
          handleSendFile={handleSendFile}
        />
      )}
    </>
  );
};

export default DropUpMenu;
