import React, { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getGroupMessages, getMessages } from "../api/message";
import { setMessages } from "../redux/messageSlice";
import toast from "react-hot-toast";

function useGetMessages() {
  const { selectedUser, selectedGroup } = useSelector((store) => store.user);
  const dispatch = useDispatch();

  const fetchMessages = useCallback(async () => {
    try {
      if (selectedUser) {
        const res = await getMessages(selectedUser._id);
        dispatch(setMessages(res?.data?.data));
                      console.log("erro hek", res);

      } else if (selectedGroup) {
        const res = await getGroupMessages(selectedGroup._id);
        dispatch(setMessages(res?.data?.data));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred while fetching messages.");
    }
  }, [selectedUser, selectedGroup, dispatch]);

  useEffect(() => {
    if (selectedUser || selectedGroup) {
      fetchMessages();
    }
  }, [selectedUser, selectedGroup, fetchMessages]);

  return null;
}

export default useGetMessages;
