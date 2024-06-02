import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMessages } from "../api/message";
import { setMessages } from "../redux/messageSlice";
import toast from "react-hot-toast";

function useGetGroupMessages() {
  const { selectedGroup } = useSelector((store) => store.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!selectedGroup) {
      return;
    }
    (async function () {
      try {
        const res = await getMessages(selectedGroup?._id);
        dispatch(setMessages(res?.data?.data));
      } catch (error) {
        toast.error(error.response.data?.message);
      }
    })();
  }, [selectedGroup?._id, setMessages]);
}

export default useGetGroupMessages;
