import { useSocket } from "@/context/SocketContext";
import { useTypedSelector } from "@/hooks/useRedux";
import peer from "@/services/webrtc/peer";
import { FaMicrophone } from "react-icons/fa";
import React, { memo, useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { IoCall, IoVideocam, IoVideocamOff } from "react-icons/io5";
import { ImPhoneHangUp } from "react-icons/im";
import { FaMicrophoneSlash } from "react-icons/fa6";
import { UserType } from "@/redux/userSlice";
import callingRingTone from "@/assets/sounds/397097__columbia23__phone-ringing.wav";

type VideoCallProps = {
  myStream: MediaStream | null;
  offer: RTCSessionDescriptionInit | undefined | null;
  isIncoming: boolean;
  isCalling: boolean;
  isConnected: boolean;
  remoteSocketIdRef: React.MutableRefObject<string | null>;
  callerDetailsRef: React.MutableRefObject<UserType | null>;
  setMyStream: React.Dispatch<React.SetStateAction<MediaStream | null>>;
  setOffer: (value: RTCSessionDescriptionInit | undefined | null) => void;
  setIsIncoming: (value: boolean) => void;
  setIsCalling: (value: boolean) => void;
  setIsConnected: (value: boolean) => void;
  isVideoRef: React.MutableRefObject<boolean>;
  callIdRef: React.MutableRefObject<string | null>;
};

export type OfferFromServer = {
  offer?: RTCSessionDescriptionInit;
  ans?: RTCSessionDescriptionInit;
  callerDetails?: UserType;
  isVideo?: boolean;
  from?: string;
  callId?: string;
};

function VideoCall({
  myStream,
  offer,
  isIncoming,
  isCalling,
  isConnected,
  remoteSocketIdRef,
  callerDetailsRef,
  setMyStream,
  setOffer,
  setIsIncoming,
  setIsCalling,
  setIsConnected,
  isVideoRef,
  callIdRef,
}: VideoCallProps) {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [time, setTime] = useState<number>(0); // Time in seconds
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const { selectedUser } = useTypedSelector((store) => store.user);
  const socket = useSocket();

  const sendStreams = useCallback(async () => {
    const senders = peer.peer?.getSenders();
    if (!myStream) return;
    for (const track of myStream.getTracks()) {
      // Check if the track is already added to the connection
      const alreadyExists = senders?.find((sender) => sender.track === track);
      if (!alreadyExists) {
        peer.peer?.addTrack(track, myStream);
      }
    }
  }, [myStream]);

  const webrtcClose = useCallback(() => {
    myStream?.getTracks().forEach((track) => track.stop());
    peer.peer?.close();
    peer.createNewPeerConnection();
  }, [myStream]);

  useEffect(() => {
    let timer: any;

    if (isRunning) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  // Function to start the stopwatch
  const startStopwatch = () => {
    setIsRunning(true);
  };

  // Function to stop the stopwatch
  const stopStopwatch = () => {
    setIsRunning(false);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleCallAccept = useCallback(async () => {
    setIsIncoming(false);
    setIsConnected(true);

    const stream = await navigator.mediaDevices.getUserMedia({
      video: isVideoRef.current,
      audio: true,
    });
    setMyStream(stream);
    if (offer) {
      const ans = await peer.getAnswer(offer);
      socket?.emit("call:accepted", {
        to: remoteSocketIdRef.current,
        ans,
        callId: callIdRef?.current,
      });
    }
    sendStreams();
    startStopwatch();
  }, [
    setIsIncoming,
    setIsConnected,
    isVideoRef,
    setMyStream,
    offer,
    sendStreams,
    socket,
    remoteSocketIdRef,
    callIdRef,
  ]);

  const handleCallAccepted = useCallback(
    async ({ ans }: OfferFromServer) => {
      if (ans) await peer.setLocalDescription(ans);
      sendStreams();
      setIsCalling(false);
      setIsConnected(true);
      startStopwatch();
    },
    [sendStreams, setIsCalling, setIsConnected],
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();

    socket?.emit("peer:nego:needed", { offer, to: remoteSocketIdRef.current }); //can't use remoteSocketId its not updated yet
  }, [socket, remoteSocketIdRef]);

  useEffect(() => {
    peer.peer?.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer?.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }: OfferFromServer) => {
      if (offer) {
        const ans = await peer.getAnswer(offer);
        socket?.emit("peer:nego:done", { to: from, ans });
        sendStreams();
      }
    },
    [socket, sendStreams],
  );

  const handleNegoNeedDone = useCallback(
    async ({ ans }: OfferFromServer) => {
      if (ans) await peer.setLocalDescription(ans);
      sendStreams();
    },
    [sendStreams],
  );

  const handleCallHangup = useCallback(() => {
    webrtcClose();
    socket?.emit("call:hangup", {
      to: remoteSocketIdRef.current,
      callId: callIdRef.current,
    });

    setMyStream(null);
    setRemoteStream(null);
    remoteSocketIdRef.current = null;
    setIsConnected(false);
    setIsMuted(false);
    setIsVideoOff(false);
    setOffer(null);
    stopStopwatch();
  }, [
    callIdRef,
    remoteSocketIdRef,
    setIsConnected,
    setMyStream,
    setOffer,
    socket,
    webrtcClose,
  ]);

  const handleCallEnd = useCallback(() => {
    webrtcClose();

    setMyStream(null);
    setRemoteStream(null);
    remoteSocketIdRef.current = null;
    setIsConnected(false);
    setIsMuted(false);
    setIsVideoOff(false);
    setOffer(null);
    stopStopwatch();
  }, [remoteSocketIdRef, setIsConnected, setMyStream, setOffer, webrtcClose]);

  const handleCallReject = useCallback(() => {
    socket?.emit("call:rejected", {
      to: remoteSocketIdRef.current,
      callId: callIdRef.current,
    });
    setIsIncoming(false);
    remoteSocketIdRef.current = null;
    setOffer(null);
  }, [socket, remoteSocketIdRef, callIdRef, setIsIncoming, setOffer]);

  const handleCallRejected = useCallback(() => {
    webrtcClose();
    remoteSocketIdRef.current = null;
    setIsCalling(false);
    setMyStream(null);
  }, [remoteSocketIdRef, setIsCalling, setMyStream, webrtcClose]);

  const handleCallStop = useCallback(() => {
    socket?.emit("call:stop", {
      to: remoteSocketIdRef.current,
      callId: callIdRef.current || null,
    });
    webrtcClose();
    remoteSocketIdRef.current = null;

    setIsCalling(false);
    setMyStream(null);
  }, [
    socket,
    remoteSocketIdRef,
    callIdRef,
    webrtcClose,
    setIsCalling,
    setMyStream,
  ]);

  const handleCallStopped = useCallback(() => {
    setIsIncoming(false);
    remoteSocketIdRef.current = null;
    setOffer(null);
  }, [remoteSocketIdRef, setIsIncoming, setOffer]);

  const handleToggleMute = useCallback(() => {
    myStream?.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled; // Toggle audio track enabled/disabled
    });
    setIsMuted((prev) => !prev);
  }, [myStream]);

  const handleToggleVideoOff = useCallback(() => {
    myStream?.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsVideoOff((prev) => !prev);
  }, [myStream]);

  useEffect(() => {
    peer.peer?.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;

      setRemoteStream(remoteStream[0]);
    });
  }, []);

  const userSocketId = useCallback(
    ({ to, callId }: { to: string; callId: string }) => {
      remoteSocketIdRef.current = to;
      callIdRef.current = callId;
    },
    [remoteSocketIdRef, callIdRef],
  );

  useEffect(() => {
    // socket?.on("incoming:call", handleIncomingCall);
    socket?.on("call:accepted", handleCallAccepted);
    socket?.on("peer:nego:needed", handleNegoNeedIncomming);
    socket?.on("peer:nego:done", handleNegoNeedDone);
    socket?.on("call:hangup", handleCallEnd);
    socket?.on("call:rejected", handleCallRejected);
    socket?.on("user:socket:id", userSocketId);
    socket?.on("call:stop", handleCallStopped);

    return () => {
      // socket?.off("incoming:call", handleIncomingCall);
      socket?.off("call:accepted", handleCallAccepted);
      socket?.off("peer:nego:needed", handleNegoNeedIncomming);
      socket?.off("peer:nego:done", handleNegoNeedDone);
      socket?.off("call:hangup", handleCallEnd);
      socket?.off("call:rejected", handleCallRejected);
      socket?.off("user:socket:id", userSocketId);
      socket?.on("call:stop", handleCallStopped);
    };
  }, [
    socket,
    // handleIncomingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedDone,
    handleCallEnd,
    handleCallRejected,
    userSocketId,
    handleCallStopped,
  ]);

  return (
    <>
      <div>
        {(isCalling || isIncoming || isConnected) && (
          <div className="fixed inset-0 z-10 flex items-center justify-center backdrop-blur-sm">
            <div className="card h-full bg-neutral p-2 text-neutral-content md:h-[70%]">
              {(isCalling || isIncoming) && callingRingTone && (
                <audio autoPlay loop>
                  <source src={callingRingTone} type={`audio/wav`} />
                </audio>
              )}
              {isConnected && myStream && (
                <div className="absolute left-2 top-2 z-20 w-[30%]">
                  <ReactPlayer
                    width="100%"
                    height="100%"
                    playing
                    muted
                    url={myStream}
                  />
                </div>
              )}
              <div className="h-full">
                {/* {remoteStream ? ( */}
                <ReactPlayer
                  height={`${isConnected && !isVideoRef.current ? "0" : "full"}`}
                  playing
                  url={remoteStream}
                />
                {(!isConnected || (isConnected && !isVideoRef.current)) && (
                  <div
                    className={`flex h-full flex-col items-center justify-center gap-2`}
                  >
                    <div
                      className={`flex h-40 w-40 items-center justify-center overflow-hidden rounded-full bg-primary`}
                    >
                      {selectedUser?.avatar ||
                      callerDetailsRef.current?.avatar ? (
                        <div className="h-full w-full rounded-full">
                          <img
                            src={
                              isCalling ||
                              (!isVideoRef.current && !callerDetailsRef.current)
                                ? selectedUser?.avatar
                                : callerDetailsRef.current?.avatar
                            }
                            alt="User Avatar"
                            className="w-full"
                          />
                        </div>
                      ) : (
                        !isConnected && (
                          <h2 className="text-2xl font-semibold text-black">
                            {(isCalling ||
                            (!isVideoRef.current && !callerDetailsRef.current)
                              ? selectedUser?.username
                              : callerDetailsRef.current?.username
                            )
                              ?.charAt(0)
                              .toUpperCase()}
                          </h2>
                        )
                      )}
                    </div>
                    <h1 className="text-3xl font-semibold text-white">
                      {isCalling ||
                      (!isVideoRef.current && !callerDetailsRef.current)
                        ? selectedUser?.username
                        : callerDetailsRef.current?.username}
                    </h1>
                    {isConnected && !isVideoRef.current && (
                      <h3>{formatTime(time)}</h3>
                    )}
                    {!isConnected && (
                      <h3>{isCalling ? "Calling..." : "Incoming..."}</h3>
                    )}{" "}
                  </div>
                )}
              </div>

              <ul className="relative flex justify-center gap-4 text-white">
                {isConnected && isVideoRef.current && (
                  <h3 className="absolute left-4">{formatTime(time)}</h3>
                )}

                {isConnected && (
                  <>
                    {isVideoRef.current && (
                      <li
                        className="cursor-pointer rounded-full bg-green-600 p-3"
                        onClick={handleToggleVideoOff}
                      >
                        {isVideoOff ? (
                          <IoVideocamOff className="h-5 w-5" />
                        ) : (
                          <IoVideocam className="h-5 w-5" />
                        )}
                      </li>
                    )}
                    <li
                      className="cursor-pointer rounded-full bg-green-600 p-3"
                      onClick={handleToggleMute}
                    >
                      {isMuted ? (
                        <FaMicrophoneSlash className="h-5 w-5" />
                      ) : (
                        <FaMicrophone className="h-5 w-5" />
                      )}
                    </li>
                  </>
                )}
                <li
                  className="cursor-pointer rounded-full bg-red-600 p-3"
                  onClick={() => {
                    if (isConnected) {
                      handleCallHangup();
                    } else if (isIncoming) {
                      handleCallReject();
                    } else if (isCalling) {
                      handleCallStop();
                    }
                  }}
                >
                  <ImPhoneHangUp className="h-5 w-5" />
                </li>
                {isIncoming && (
                  <li
                    className="cursor-pointer rounded-full bg-green-600 p-3"
                    onClick={handleCallAccept}
                  >
                    <IoCall className="h-5 w-5" />
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default memo(VideoCall);
