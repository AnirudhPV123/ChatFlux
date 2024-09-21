import { useEffect } from "react";

import { setMessages } from "@/redux/messageSlice";
import { useSocket } from "@/context/SocketContext";

import { setChats } from "@/redux/chatSlice";
import { useTypedDispatch, useTypedSelector } from "../useRedux";

const useGetRealTimeMessage = () => {
  const { messages } = useTypedSelector((store) => store.message);
  const { selectedUser, selectedGroup } = useTypedSelector(
    (store) => store.user,
  );
  const { chats } = useTypedSelector((store) => store.chat);

  const socket = useSocket();
  const dispatch = useTypedDispatch();

  // // set notification of a specific chat to 0 when receiver selected that chat
  // // receiver
  useEffect(() => {
    if (!chats || (!selectedUser && !selectedGroup)) return;

    const updatedChats = chats?.map((chat) => {
      // check chat id === selectedGroup._id
      if (chat.isGroupChat && chat?._id === selectedGroup?._id) {
        console.log("group");
        return { ...chat, lastMessageTime: null, notification: 0 };
      }

      // Check if selectedUser is one of the participants
      // If selectedUser is a participant, set notification to 0
      if (
        !chat.isGroupChat &&
        chat.participants.some(
          (participant) => participant?._id === selectedUser?._id,
        )
      ) {
        return { ...chat, lastMessageTime: null, notification: 0 };
      }
      return chat; // Otherwise, return the chat unchanged
    });

    console.log(updatedChats);

    dispatch(setChats(updatedChats));
  }, [selectedUser, selectedGroup]);

  // receiver gets new message from backend
  // send by backend or receiver (depends)
  // emit status
  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      // check whether the senderId and selectedUser._id is equal
      // if set message status to seen and send status update to backend
      // else set message status to delivered and send status update to backend
      if (
        selectedUser &&
        selectedUser?._id === newMessage.senderId &&
        newMessage.conversationId
      ) {
        newMessage.status = "seen";
        // check message exist
        if (messages[0]?.conversationId === newMessage.conversationId) {
          dispatch(setMessages([...messages, newMessage]));
        } else {
          dispatch(setMessages([newMessage]));
        }
        // emit seen status to backend
        socket?.emit(
          "new_message_status_update_from_receiver_to_backend",
          newMessage._id,
          newMessage.conversationId,
          "seen",
        );
      } else if (selectedGroup && selectedGroup?._id === newMessage?.groupId) {
        if (messages[0]?.groupId === newMessage?.groupId) {
          dispatch(setMessages([...messages, newMessage]));
        } else {
          dispatch(setMessages([newMessage]));
        }

        // participant seen the message so emit to remove participant id from message notification array
        socket?.emit(
          "new_message_status_update_from_group_participant_to_backend",
          newMessage._id,
          // newMessage.groupId
        );
      } else if (newMessage?.conversationId) {
        // message senderId !== selectedUser._id
        // so set status delivered
        const updatedChats = chats.map((chat) => {
          if (chat._id === newMessage.conversationId) {
            return {
              ...chat,
              lastMessageTime: newMessage?.createdAt,
              notification: (chat.notification || 0) + 1,
            };
          } else {
            return chat;
          }
        });

        dispatch(setChats(updatedChats));

        // emit delivered status when sender is not selected
        socket?.emit(
          "new_message_status_update_from_receiver_to_backend",
          newMessage._id,
          newMessage.conversationId,
          "delivered",
        );
      } else if (newMessage?.groupId) {
        // message senderId !== selectedUser._id
        // so set status delivered
        const updatedChats = chats.map((chat) => {
          if (chat._id === newMessage.groupId) {
            return {
              ...chat,
              lastMessageTime: newMessage?.createdAt,
              notification: (chat.notification || 0) + 1,
            };
          } else {
            return chat;
          }
        });

        dispatch(setChats(updatedChats));

        // emit delivered status when sender is not selected
        socket?.emit(
          "new_message_status_update_from_receiver_to_backend",
          newMessage._id,
          newMessage.conversationId,
          "delivered",
        );
      }
    };

    // new message
    socket?.on("new_message", handleNewMessage);

    return () => {
      socket?.off("new_message", handleNewMessage);
    };
  }, [socket, messages, dispatch, chats]);

  // sender gets message status update from backend
  // send ny receiver
  // this code is used to update new message status or update all message status when receiver call getAllChats
  useEffect(() => {
    const handleMessageStatusUpdate = (conversationId, status) => {
      const updatedMessage = messages?.map((message) =>
        message?.conversationId === conversationId && message.status !== "seen"
          ? { ...message, status: status }
          : message,
      );
      dispatch(setMessages(updatedMessage));
    };
    socket?.on(
      "message_status_update_from_backend_to_sender",
      handleMessageStatusUpdate,
    );

    return () => {
      socket?.off(
        "message_status_update_from_backend_to_sender",
        handleMessageStatusUpdate,
      );
    };
  }, [socket, messages, dispatch, chats]);

  useEffect(() => {
    const handleMessageDeleted = (deletedMessageId) => {
      const updatedMessage = messages?.map((message) =>
        message?._id === deletedMessageId
          ? { ...message, messageReplyDetails: null, message: null }
          : message,
      );
      dispatch(setMessages(updatedMessage));
    };
    socket?.on("message_deleted", handleMessageDeleted);

    return () => {
      socket?.off("message_deleted", handleMessageDeleted);
    };
  }, [socket, messages, dispatch, chats]);
};

export default useGetRealTimeMessage;
