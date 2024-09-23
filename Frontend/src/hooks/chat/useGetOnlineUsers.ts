import { useEffect } from "react";
import { useSocket } from "@/context/SocketContext";
import { setOnlineUsers } from "@/redux/userSlice";
import { useTypedDispatch, useTypedSelector } from "../useRedux";

function useGetOnlineUsers() {
  const { authUser } = useTypedSelector((store) => store.user);

  const dispatch = useTypedDispatch();
  const socket = useSocket();

  useEffect(() => {
    const handleOnlineUsers = (onlineUsers: string[]) => {
      dispatch(setOnlineUsers(onlineUsers));
    };

    if (socket) {
      socket?.on("getOnlineUsers", handleOnlineUsers);
    }

    return () => {
      socket?.off("getOnlineUsers", handleOnlineUsers);
    };
  }, [socket, dispatch, authUser]);
}

export default useGetOnlineUsers;
