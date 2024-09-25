import { useSocket } from "@/context/SocketContext";
import { useTypedSelector } from "@/hooks/useRedux";
import peer from "@/services/webrtc/peer";
import { FaMicrophone } from "react-icons/fa";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { IoCall, IoVideocam, IoVideocamOff } from "react-icons/io5";
import { ImPhoneHangUp } from "react-icons/im";
import { FaMicrophoneSlash } from "react-icons/fa6";
import { UserType } from "@/redux/userSlice";

function VideoCall() {
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  // const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
  const [offer, setOffer] = useState<any | null>(null);
  const [isIncoming, setIsIncoming] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const { selectedUser } = useTypedSelector((store) => store.user);
  const socket = useSocket();
  const remoteSocketIdRef = useRef<string | null>(null);
  const callerDetailsRef = useRef<UserType | null>(null);

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

  const handleCallUser = useCallback(async () => {
    setIsCalling(true);
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    const offer = await peer.getOffer();
    socket?.emit("user:call", { toUserId: selectedUser?._id, offer });
    setMyStream(stream);
  }, [socket, selectedUser]);

  const handleIncomingCall = useCallback(
    async ({ from, offer, callerDetails }) => {
      setIsIncoming(true);
      callerDetailsRef.current = callerDetails;

      remoteSocketIdRef.current = from;
      setOffer(offer);
    },
    [],
  );

  const handleCallAccept = useCallback(async () => {
    setIsIncoming(false);
    setIsCalling(false);
    setIsConnected(true);

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setMyStream(stream);
    if (offer) {
      const ans = await peer.getAnswer(offer);
      socket?.emit("call:accepted", { to: remoteSocketIdRef.current, ans });
    }
    sendStreams();
  }, [offer, remoteSocketIdRef, socket, sendStreams]);

  const handleCallAccepted = useCallback(
    async ({ from, ans }) => {
      await peer.setLocalDescription(ans);
      sendStreams();
      setIsCalling(false);
      setIsConnected(true);
    },
    [sendStreams],
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
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket?.emit("peer:nego:done", { to: from, ans });
      sendStreams();
    },
    [socket, sendStreams],
  );

  const handleNegoNeedDone = useCallback(
    async ({ from, ans }) => {
      await peer.setLocalDescription(ans);
      sendStreams();
    },
    [sendStreams],
  );

  const handleCallHangup = useCallback(() => {
    myStream?.getTracks().forEach((track) => track.stop());
    peer.peer?.close();
    peer.createNewPeerConnection();
    socket?.emit("call:hangup", { to: remoteSocketIdRef.current });

    setMyStream(null);
    setRemoteStream(null);
    remoteSocketIdRef.current = null;
    setIsConnected(false);
    setIsMuted(false);
    setIsVideoOff(false);
    setOffer(null);
  }, [myStream, remoteSocketIdRef, socket]);

  const handleCallEnd = useCallback(() => {
    myStream?.getTracks().forEach((track) => track.stop());
    peer.peer?.close();
    peer.createNewPeerConnection();

    setMyStream(null);
    setRemoteStream(null);
    remoteSocketIdRef.current = null;
    setIsConnected(false);
    setIsMuted(false);
    setIsVideoOff(false);
    setOffer(null);
  }, [myStream]);

  const handleCallReject = useCallback(() => {
    socket?.emit("call:rejected", { to: remoteSocketIdRef.current });
    setIsIncoming(false);
    remoteSocketIdRef.current = null;
    setOffer(null);
  }, [socket, remoteSocketIdRef]);

  const handleCallRejected = useCallback(() => {
    myStream?.getTracks().forEach((track) => track.stop());
    peer.peer?.close();
    peer.createNewPeerConnection();
    remoteSocketIdRef.current = null;
    setIsCalling(false);
    setMyStream(null);
  }, [myStream, remoteSocketIdRef]);

  const handleCallStop = useCallback(() => {
    socket?.emit("call:stop", { to: remoteSocketIdRef.current });
    myStream?.getTracks().forEach((track) => track.stop());
    peer.peer?.close();
    peer.createNewPeerConnection();
    remoteSocketIdRef.current = null;

    setIsCalling(false);
    setMyStream(null);
  }, [socket, remoteSocketIdRef, myStream]);

  const handleCallStopped = useCallback(() => {
    setIsIncoming(false);
    remoteSocketIdRef.current = null;
    setOffer(null);
  }, []);

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

  const userSocketId = useCallback(({ to }) => {
    remoteSocketIdRef.current = to;
  }, []);

  useEffect(() => {
    socket?.on("incoming:call", handleIncomingCall);
    socket?.on("call:accepted", handleCallAccepted);
    socket?.on("peer:nego:needed", handleNegoNeedIncomming);
    socket?.on("peer:nego:done", handleNegoNeedDone);
    socket?.on("call:hangup", handleCallEnd);
    socket?.on("call:rejected", handleCallRejected);
    socket?.on("user:socket:id", userSocketId);
    socket?.on("call:stop", handleCallStopped);

    return () => {
      socket?.off("incoming:call", handleIncomingCall);
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
    handleIncomingCall,
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
      <div className="absolute right-6">
        <IoVideocam
          className="h-6 w-6 cursor-pointer"
          onClick={handleCallUser}
        />
        <IoCall className="h-6 w-6 cursor-pointer" onClick={handleCallUser} />
      </div>
      <div>
        {(isCalling || isIncoming || isConnected) && (
          <div className="fixed inset-0 z-10 flex items-center justify-center backdrop-blur-sm">
            <div className="card h-[70%] bg-neutral p-2 text-neutral-content">
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
                <ReactPlayer height="full" playing url={remoteStream} />
                {!remoteStream && (
                  <div className="flex h-full flex-col items-center justify-center gap-2">
                    <div
                      className={`flex h-40 w-40 items-center justify-center overflow-hidden rounded-full bg-primary`}
                    >
                      {(isCalling && selectedUser?.avatar) ||
                      (isIncoming && callerDetailsRef.current) ? (
                        <div className="h-full w-full rounded-full">
                          <img
                            src={
                              isCalling
                                ? selectedUser?.avatar
                                : callerDetailsRef.current?.avatar
                            }
                            alt="User Avatar"
                            className="w-full"
                          />
                        </div>
                      ) : (
                        <h2 className="text-2xl font-semibold text-black">
                          {(isCalling
                            ? selectedUser?.username
                            : callerDetailsRef.current?.username
                          )
                            ?.charAt(0)
                            .toUpperCase()}
                        </h2>
                      )}
                    </div>
                    <h1 className="text-3xl font-semibold text-white">
                      {isCalling
                        ? selectedUser?.username
                        : callerDetailsRef.current?.username}
                    </h1>
                    {!isConnected && (
                      <h3>{isCalling ? "Calling..." : "Incoming..."}</h3>
                    )}{" "}
                  </div>
                )}
              </div>

              <ul className="my-4 flex justify-center gap-4 text-white">
                {isConnected && (
                  <>
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

export default VideoCall;
