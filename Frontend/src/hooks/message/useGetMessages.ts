import React, { useEffect, useCallback } from "react";
import { getGroupMessages, getMessages } from "@/services/api/message";
import { setMessages } from "@/redux/messageSlice";
import toast from "react-hot-toast";
import { useTypedDispatch, useTypedSelector } from "../useRedux";
import CustomError from "@/types/CustomErrorType";

function useGetMessages() {
  const { selectedUser, selectedGroup } = useTypedSelector(
    (store) => store.user,
  );
  const dispatch = useTypedDispatch();

  const fetchMessages = useCallback(async () => {
    try {
      if (selectedUser) {
        const res = await getMessages(selectedUser._id);
        dispatch(setMessages(res?.data?.data));
      } else if (selectedGroup) {
        const res = await getGroupMessages(selectedGroup._id);
        dispatch(setMessages(res?.data?.data));
      }
    } catch (error) {
      const customError = error as CustomError;
      toast.error(
        customError.response?.data?.message ||
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
