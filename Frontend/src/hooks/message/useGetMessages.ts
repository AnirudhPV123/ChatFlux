import React, { useEffect, useCallback } from "react";
import { getGroupMessages, getMessages } from "@/services/api/message";
import { setMessages } from "@/redux/messageSlice";
import toast from "react-hot-toast";
import { useTypedDispatch, useTypedSelector } from "../useRedux";

function useGetMessages() {
  const { selectedUser, selectedGroup } = useTypedSelector(
    (store) => store.user,
  );
  const dispatch = useTypedDispatch();

  const fetchMessages = useCallback(async () => {
    try {
      if (selectedUser) {
        const res = await getMessages(selectedUser._id);
        console.log("one-on-one chat get:", res);
        dispatch(setMessages(res?.data?.data));
      } else if (selectedGroup) {
        const res = await getGroupMessages(selectedGroup._id);
        console.log("group chat get:", res);
        dispatch(setMessages(res?.data?.data));
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "An error occurred while fetching messages.",
      );
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
