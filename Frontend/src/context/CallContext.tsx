import { OfferFromServer } from "@/components/MessageContainer/VideoCall";
import { UserType } from "@/redux/userSlice";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSocket } from "./SocketContext";

type CallContext = {
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

const CallContext = createContext<CallContext | null>(null);

export const useCallContext = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCallContext must be used within a SocketProvider");
  }
  return context;
};

export const CallProvider = ({ children }: { children: ReactNode }) => {
  const [isCalling, setIsCalling] = useState(false);
  const [isIncoming, setIsIncoming] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [offer, setOffer] = useState<
    RTCSessionDescriptionInit | undefined | null
  >(null);
  const remoteSocketIdRef = useRef<string | null>(null);
  const callerDetailsRef = useRef<UserType | null>(null);
  const isVideoRef = useRef(false);
  const callIdRef = useRef<string | null>(null);

  const socket = useSocket();

  const handleIncomingCall = useCallback(
    async ({
      from,
      offer,
      callerDetails,
      isVideo,
      callId,
    }: OfferFromServer) => {
      setIsIncoming(true);
      console.log(from, offer, callerDetails, isVideo);
      console.log(callId);
      if (callId) callIdRef.current = callId;

      if (from && callerDetails && isVideo !== undefined && callId) {
        isVideoRef.current = isVideo;
        console.log("isVideo", isVideo);
        callerDetailsRef.current = callerDetails;
        remoteSocketIdRef.current = from;
      }
      setOffer(offer);
    },
    [],
  );

  useEffect(() => {
    socket?.on("incoming:call", handleIncomingCall);

    return () => {
      socket?.off("incoming:call", handleIncomingCall);
    };
  }, [socket, handleIncomingCall]);

  const contextValue = {
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
  };

  return (
    <CallContext.Provider value={contextValue}>{children}</CallContext.Provider>
  );
};
