import { Camera, CircleX, SendHorizontal, Trash2, Video } from "lucide-react";
import React, { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";

const CameraCapture = ({
  isCamera,
  setIsCamera,
  capturedPhoto,
  capturedVideo,
  setCapturedPhoto,
  setCapturedVideo,
  handleSendFile,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);

  const [isVideo, setIsVideo] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);

  const handleCapturePhoto = React.useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedPhoto(imageSrc);
  }, [webcamRef]);

  const videoConstraints = {
    width: 720,
    height: 480,
    facingMode: "user",
  };

  const handleStartCaptureVideo = useCallback(() => {
    setIsRecording(true);
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: "video/webm",
    });
    mediaRecorderRef.current.addEventListener(
      "dataavailable",
      handleDataAvailable
    );
    mediaRecorderRef.current.start();

    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime((prevTime) => prevTime + 1);
    }, 1000);
  }, [webcamRef, setIsRecording]);

  const handleDataAvailable = useCallback(({ data }) => {
    if (data.size > 0) {
      setRecordedChunks((prev) => prev.concat(data));
    }
  }, []);

  const handleStopCaptureVideo = useCallback(() => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setRecordingTime(0);
    clearInterval(timerRef.current); // Stop timer
  }, [mediaRecorderRef, webcamRef, setIsRecording]);

  useEffect(() => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      setCapturedVideo(blob);
      setRecordedChunks([]);
    }
  }, [recordedChunks]);

  const handleCapture = () => {
    if (!capturedPhoto && !capturedVideo) {
      if (!isVideo) {
        handleCapturePhoto();
      } else {
        if (!isRecording) {
          handleStartCaptureVideo();
        } else {
          handleStopCaptureVideo();
        }
      }
    }
  };

  const handleDelete = () => {
    if (capturedPhoto) {
      setCapturedPhoto(null);
    } else {
      setCapturedVideo(null);
      setIsRecording(false);
    }
  };

  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setTimeout(() => {
        setRecordingTime(0);
        handleStopCaptureVideo(); // Assuming you have a function to stop video capture
      }, 5 * 60 * 1000); // 5 minutes in milliseconds
    }

    return () => clearTimeout(timer);
  }, [isRecording]);

  return (
    <div className="backdrop-blur-sm top-0 left-0 w-full h-full z-20 absolute ">
      <div className="w-1/3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1D232A] border border-gray-400 rounded-lg p-4">
        <div className="flex justify-between mb-4">
          {isRecording ? (
            <h4>{`${Math.floor(recordingTime / 60)
              .toString()
              .padStart(2, "0")}:${(recordingTime % 60)
              .toString()
              .padStart(2, "0")}`}</h4>
          ) : (
            <div></div>
          )}
          {capturedPhoto ? (
            <p>
              {Math.round(capturedPhoto.size / 1024) < 1024
                ? Math.round(capturedPhoto.size / 1024) + " KB"
                : Math.round(capturedPhoto.size / (1024 * 1024)) + " MB"}
            </p>
          ) : capturedVideo ? (
            <p>
              {Math.round(capturedVideo.size / 1024) < 1024
                ? Math.round(capturedVideo.size / 1024) + " KB"
                : Math.round(capturedVideo.size / (1024 * 1024)) + " MB"}
            </p>
          ) : (
            <div></div>
          )}
          {capturedPhoto || capturedVideo ? (
            <Trash2
              className="text-primary cursor-pointer"
              strokeWidth={2}
              size={30}
              onClick={handleDelete}
            />
          ) : (
            <div></div>
          )}
          <CircleX
            className="text-primary"
            strokeWidth={2}
            size={30}
            onClick={() => {
              setIsCamera(false);
              setIsCamera(false);
              setCapturedPhoto(null);
              setCapturedVideo(null);
              setIsRecording(false);
              setRecordedChunks([]);
              setIsVideo(false);
              setRecordingTime(0);
            }}
          />
        </div>
        {isCamera && !capturedVideo && !capturedPhoto && (
          <Webcam
            audio={true}
            height={480}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={720}
            videoConstraints={videoConstraints}
          />
        )}
        {capturedVideo && (
          <video
            src={URL.createObjectURL(capturedVideo)}
            controls
            height={480}
            width={720}
          />
        )}

        {capturedPhoto && (
          <img src={capturedPhoto} height={480} width={720} alt="img" />
        )}

        {/* bottom buttons */}
        <div className="flex justify-center items-center mt-2">
          {/* capture btn */}
          <button
            className="h-12 w-12 rounded-full bg-gray-400 border-4 border-black"
            onClick={handleCapture}
          >
            <div className="h-8 w-8 rounded-full m-auto border-4 border-black"></div>
          </button>
          {/* photo btn */}
          <div
            className={`${
              !isVideo && "bg-gray-700"
            } ml-4 p-2 rounded-full cursor-pointer`}
            onClick={() => {
              setIsVideo(false);
              setIsRecording(false);
              setCapturedVideo(null);
            }}
          >
            <Camera size={25} strokeWidth={3} />
          </div>
          {/* video btn */}
          <div
            className={`${
              isVideo && "bg-gray-700"
            } ml-4 p-2 rounded-full cursor-pointer`}
            onClick={() => {
              setIsVideo(true);
              setCapturedPhoto(null);
            }}
          >
            <Video size={25} strokeWidth={3} />
          </div>
          <div
            className="absolute right-4 cursor-pointer"
            onClick={() => {
              (capturedPhoto || capturedVideo) && handleSendFile(); setIsCamera(false)
            }}
          >
            <SendHorizontal
              strokeWidth={2}
              size={30}
              className="text-primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
