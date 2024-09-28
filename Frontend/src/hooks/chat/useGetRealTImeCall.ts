import { useSocket } from "@/context/SocketContext";
import { useEffect } from "react";
import { useTypedDispatch, useTypedSelector } from "../useRedux";
import { CallType, setCalls } from "@/redux/callSlice";

const useGetRealTimeCall = () => {
  const { calls } = useTypedSelector((store) => store.call);
  const dispatch = useTypedDispatch();
  const socket = useSocket();
  useEffect(() => {
    const handleNewCall = (newCall: CallType) => {
      dispatch(setCalls([newCall, ...calls]));
    };

    socket?.on("new:call", handleNewCall);

    return () => {
      socket?.off("new:call", handleNewCall);
    };
  }, [socket, dispatch, calls]);
};

export default useGetRealTimeCall;
