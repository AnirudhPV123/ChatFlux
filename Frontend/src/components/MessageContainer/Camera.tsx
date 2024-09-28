import { Camera, CircleX, SendHorizontal, Trash2, Video } from "lucide-react";
import React, { useState, useRef, useCallback, useEffect, memo } from "react";
import toast from "react-hot-toast";
import Webcam from "react-webcam";

type CameraCaptureProps = {
  isCamera: boolean;
  setIsCamera: React.Dispatch<React.SetStateAction<boolean>>;
  capturedPhoto: string;
  capturedVideo: File;
  setCapturedPhoto: React.Dispatch<React.SetStateAction<string | null>>;
  setCapturedVideo: React.Dispatch<React.SetStateAction<File | null>>;
  handleSendFile: () => Promise<void>;
};

const CameraCapture = ({
  isCamera,
  setIsCamera,
  capturedPhoto,
  capturedVideo,
  setCapturedPhoto,
  setCapturedVideo,
  handleSendFile,
}: CameraCaptureProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);

  const [isVideo, setIsVideo] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const webcamRef = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);

  const handleCapturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    setCapturedPhoto(imageSrc as string);
  }, [webcamRef, setCapturedPhoto]);

  const videoConstraints = {
    width: 720,
    height: 480,
    facingMode: "user",
  };

  const handleDataAvailable = useCallback(({ data }: { data: any }) => {
    if (data.size > 0) {
      setRecordedChunks((prev) => prev.concat(data));
    }
  }, []);

  const handleStartCaptureVideo = useCallback(() => {
    setIsRecording(true);
    const stream = webcamRef.current?.stream;
    if (stream) {
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "video/webm",
      });
      mediaRecorderRef.current.addEventListener(
        "dataavailable",
        handleDataAvailable,
      );
      mediaRecorderRef.current.start();

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      toast.error("Webcam stream is not available");
    }
  }, [webcamRef, setIsRecording, handleDataAvailable]);

  const handleStopCaptureVideo = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    setRecordingTime(0);
    clearInterval(timerRef.current as number); // Stop timer
  }, [mediaRecorderRef, setIsRecording]);

  useEffect(() => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      setCapturedVideo(blob as File);
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
    let timer: number | null = null;
    if (isRecording) {
      timer = setTimeout(
        () => {
          setRecordingTime(0);
          handleStopCaptureVideo(); // Assuming you have a function to stop video capture
        },
        5 * 60 * 1000,
      ); // 5 minutes in milliseconds
    }

    return () => clearTimeout(timer as number);
  }, [isRecording]);

  return (
    <div className="absolute left-0 top-0 z-20 h-full w-full backdrop-blur-sm">
      <div className="absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 rounded-lg border border-gray-400 bg-[#1D232A] p-4 md:w-1/2 lg:w-1/3">
        <div className="mb-4 flex justify-between">
          {isRecording ? (
            <h4>{`${Math.floor(recordingTime / 60)
              .toString()
              .padStart(2, "0")}:${(recordingTime % 60)
              .toString()
              .padStart(2, "0")}`}</h4>
          ) : (
            <div></div>
          )}
          {capturedVideo && (
            <p>
              {Math.round(capturedVideo.size / 1024) < 1024
                ? Math.round(capturedVideo.size / 1024) + " KB"
                : Math.round(capturedVideo.size / (1024 * 1024)) + " MB"}
            </p>
          )}
          {capturedPhoto || capturedVideo ? (
            <Trash2
              className="cursor-pointer text-primary"
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
            className="w-full"
            ref={webcamRef}
            screenshotFormat="image/jpeg"
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
        <div className="mt-2 flex items-center justify-center">
          {/* capture btn */}
          <button
            className="h-12 w-12 rounded-full border-4 border-black bg-gray-400"
            onClick={handleCapture}
          >
            <div className="m-auto h-8 w-8 rounded-full border-4 border-black"></div>
          </button>
          {/* photo btn */}
          <div
            className={`${
              !isVideo && "bg-gray-700"
            } ml-4 cursor-pointer rounded-full p-2`}
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
            } ml-4 cursor-pointer rounded-full p-2`}
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
              if (capturedPhoto || capturedVideo) {
                handleSendFile();
              }
              setIsCamera(false);
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

export default memo(CameraCapture);
