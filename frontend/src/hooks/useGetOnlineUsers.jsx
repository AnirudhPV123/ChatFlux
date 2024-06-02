import React, { useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import { useDispatch, useSelector } from "react-redux";
import { setOnlineUsers } from "../redux/userSlice";


function useGetOnlineUsers() {
  const {authUser} = useSelector(store=>store.user)
  const dispatch= useDispatch()
  const socket = useSocket();

  useEffect(() => {
    socket?.on("getOnlineUsers", (onlineUsers) => {
      dispatch(setOnlineUsers(onlineUsers))
    });
  }, [authUser]);
  return
}

export default useGetOnlineUsers;
