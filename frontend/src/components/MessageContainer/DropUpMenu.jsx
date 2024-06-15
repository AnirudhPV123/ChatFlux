import {
  CircleX,
  Camera,
  FolderClosed,
  Images,
  Paperclip,
  SendHorizontal,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { sendFileMessage, sendGroupFileMessage } from "../../api/message";
import { setMessages, setUpdateMessage } from "../../redux/messageSlice";
import CameraCapture from "./Camera";
import { createTemporaryMessage } from "../../utils/createTemporaryMessage";

const DropUpMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("");
  const [caption, setCaption] = useState("");
  const [isCamera, setIsCamera] = useState(false);

  const [capturedVideo, setCapturedVideo] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);

  const autoCloseDropMenuRef = useRef();
  const fileInputRef = useRef(null);
  const photoAndVideoInputRef = useRef(null);

  const { selectedGroup, selectedUser, authUser ,selectedChat} = useSelector(
    (store) => store.user
  );
  const { messageReplyDetails } = useSelector((store) => store.temporary);
  const { messages } = useSelector((store) => store.message);

  const dispatch = useDispatch();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleFileFolderClick = () => {
    fileInputRef.current.click();
  };

  const handlePhotoAndVideoFolderClick = () => {
    photoAndVideoInputRef.current.click();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        autoCloseDropMenuRef.current &&
        !autoCloseDropMenuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const base64ToBlob = (base64, mimeType) => {
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

    console.log("here");
    console.log("check:", capturedPhoto);

    let cameraPhotoFile;
    // Check if file is in base64 format
    if (
      capturedPhoto &&
      typeof capturedPhoto === "string" &&
      capturedPhoto.startsWith("data:")
    ) {
      const mimeType = capturedPhoto.match(/data:(.*);base64,/)[1];
      cameraPhotoFile = base64ToBlob(capturedPhoto, mimeType);
      formData.append("file", cameraPhotoFile, "image.jpeg"); // Change the name as needed
    } else if (capturedVideo) {
      formData.append("file", capturedVideo, "video.webm");
    } else {
      formData.append("file", file);
    }

    formData.append("caption", caption);

    const tempMessageId = `temp-${Date.now()}`;

    // temporary message (utils/createTemporaryMessage)
    // temporary message
    console.log("capture", capturedPhoto);
    const temporaryMessage = createTemporaryMessage({
      content: URL.createObjectURL(
        capturedPhoto ? cameraPhotoFile : capturedVideo ? capturedVideo : file
      ),
      type: capturedPhoto
        ? "image"
        : capturedVideo
        ? "video"
        : file.type.split("/")[0],
      format: capturedPhoto || capturedVideo ? "webm" : file.type.split("/")[1],
      tempMessageId,
      senderId: authUser._id,
      caption,
      ...(selectedUser && {
        conversationId: selectedChat?._id,
      }),
      ...(selectedGroup && {
        groupId: selectedChat?._id,
      }),
    });

    dispatch(setMessages([...messages, temporaryMessage]));
    setFile(null);
    setIsOpen(false);
    setFileType("");
    setCaption("");
    setCapturedPhoto("");
    setCapturedVideo("");

    try {
      let res;
      if(selectedUser){
        res = await sendFileMessage(selectedUser._id, formData);
      }else if(selectedGroup){
        res = await sendGroupFileMessage(selectedGroup._id, formData);
      }

      if (res && res.data && res.data.data) {
        dispatch(
          setUpdateMessage({ tempMessageId, newMessage: res.data.data })
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "An error occurred while sending the message."
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

  const truncateFileName = (fileName) => {
    const maxLength = 20; // Maximum length of file path
    if (fileName.length <= maxLength) return fileName;

    const truncatedLength = Math.floor((maxLength - 6) / 2); // Leave space for the ellipsis and some part of the file name
    const fileNameWithoutExtension = fileName.split(".").slice(0, -1).join(".");
    const extension = fileName.split(".").pop();
    const beginningPart = fileNameWithoutExtension.substring(
      0,
      truncatedLength
    );
    const endingPart = fileNameWithoutExtension.substring(
      fileNameWithoutExtension.length - truncatedLength
    );
    const truncatedName = `${beginningPart}...${endingPart}.${extension}`;
    return truncatedName;
  };

  return (
    <>
      <div className="relative" ref={autoCloseDropMenuRef}>
        <button
          onClick={toggleMenu}
          className="flex items-center justify-center p-2 bg-gray-800 text-white rounded-full focus:outline-none"
          disabled={messageReplyDetails?.status}
        >
          <Paperclip />
        </button>
        <div
          className={`absolute bottom-full mb-2 left-0 bg-[#1D232A] border border-gray-500 rounded-lg shadow-lg transition-all duration-50 w-48 px-2 overflow-hidden ${
            isOpen ? `max-h-60 opacity-100 py-2` : `max-h-0 py-0 opacity-0 `
          } `}
        >
          <ul className="flex flex-col">
            <li
              className="flex items-center hover:bg-gray-700 cursor-pointer p-2 rounded-md"
              onClick={handleFileFolderClick}
            >
              <FolderClosed
                strokeWidth={3}
                className="w-5 h-5 text-blue-500 rounded mr-3"
              />
              <span>File</span>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={(e) => setFile(e.target.files[0])}
              />
            </li>
            <li
              className="flex items-center hover:bg-gray-700 cursor-pointer p-2 rounded-md"
              onClick={handlePhotoAndVideoFolderClick}
            >
              <Images
                strokeWidth={3}
                className="w-5 h-5 text-green-500 rounded mr-3"
              />
              <span>Photos & Videos</span>
              <input
                type="file"
                accept="video/*,image/*" // Accept both video and image files
                ref={photoAndVideoInputRef}
                style={{ display: "none" }}
                onChange={(e) => setFile(e.target.files[0])}
              />
            </li>
            <li
              className="flex items-center hover:bg-gray-700 cursor-pointer p-2 rounded-md"
              onClick={() => setIsCamera(true)}
            >
              <Camera
                strokeWidth={3}
                className="w-5 h-5 text-orange-500 rounded mr-3"
              />
              <span>Camera</span>
            </li>
          </ul>
        </div>
      </div>
      {/* show preview */}
      {file && (
        <div className="backdrop-blur-sm top-0 left-0 w-full h-full z-20 absolute ">
          <div className="w-1/4 p-4 bg-[#1D232A] border border-gray-400 rounded-lg absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ">
            <div className="flex justify-end mb-4">
              <CircleX
                size={25}
                className="text-primary cursor-pointer"
                onClick={() => setFile(null)}
              />
            </div>
            <div className="flex justify-between mb-2">
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
            <div className="flex justify-between mt-6 gap-2 items-center ">
              <input
                type="text"
                className="grow input input-bordered border-gray-500"
                placeholder="Add a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />

              <SendHorizontal
                size={25}
                className="text-primary cursor-pointer"
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
          capturedPhoto={capturedPhoto}
          setCapturedPhoto={setCapturedPhoto}
          capturedVideo={capturedVideo}
          setCapturedVideo={setCapturedVideo}
          handleSendFile={handleSendFile}
        />
      )}
    </>
  );
};

export default DropUpMenu;
