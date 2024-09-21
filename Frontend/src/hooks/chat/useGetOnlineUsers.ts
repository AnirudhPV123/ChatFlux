import React, { useEffect } from "react";
import { useSocket } from "@/context/SocketContext";
import { setOnlineUsers } from "@/redux/userSlice";
import { useTypedDispatch, useTypedSelector } from "../useRedux";

function useGetOnlineUsers() {
  const { authUser } = useTypedSelector((store) => store.user);
  const { chats } = useTypedSelector((store) => store.chat);

  const dispatch = useTypedDispatch();
  const socket = useSocket();

  useEffect(() => {
    // socket?.on("getOnlineUsers", (onlineUsers) => {
    //   console.log("oneli", onlineUsers);
    //   // dispatch(setOnlineUsers(onlineUsers));
    // });

    const handleOnlineUsers = (onlineUsers) => {
      console.log("oneli", onlineUsers);
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
