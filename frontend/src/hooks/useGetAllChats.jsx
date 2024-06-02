import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setChats } from "../redux/chatSlice";
import toast from "react-hot-toast";
import { getAllChats } from "../api/chat";

function useGetAllChats() {
  const dispatch = useDispatch();
  useEffect(() => {
    (async function () {
      try {
        const res = await getAllChats();
        dispatch(setChats(res.data?.data));
      } catch (error) {
        toast.error(error.response.data?.message);
      }
    })();
  }, []);
}

export default useGetAllChats;
