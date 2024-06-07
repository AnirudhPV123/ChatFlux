import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setMessages } from "../redux/messageSlice";
import { useSocket } from "../context/SocketContext";

import { setChats } from "../redux/chatSlice";

const useGetRealTimeMessage = () => {
  const { messages } = useSelector((store) => store.message);
  const { selectedUser, selectedGroup } = useSelector((store) => store.user);
  const { chats } = useSelector((store) => store.chat);

  const socket = useSocket();
  const dispatch = useDispatch();

  // set notification of a specific chat to 0 when receiver selected that chat
  // receiver
  useEffect(() => {
    if (!chats || !selectedUser) return;

    const updatedChats = chats?.map((chat) => {
      const participants = chat?.participants;
      if (
        participants &&
        (participants[0]?._id === selectedUser?._id ||
          participants[1]?._id === selectedUser?._id)
      ) {
        return { ...chat, notification: 0 };
      }
      return chat;
    });

    dispatch(setChats(updatedChats));
  }, [selectedUser]);

  // receiver gets new message from backend
  // send by backend or receiver (depends)
  // emit status
  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      // check whether the senderId and selectedUser._id is equal
      // if set message status to seen and send status update to backend
      // else set message status to delivered and send status update to backend
      if (selectedUser?._id === newMessage.senderId) {
        newMessage.status = "seen";
        // check message exist
        if (messages) {
          dispatch(setMessages([...messages, newMessage]));
        } else {
          dispatch(setMessages([newMessage]));
        }
        // emit seen status to backend
        socket.emit(
          "new_message_status_update_from_receiver_to_backend",
          newMessage._id,
          newMessage.conversationId,
          "seen"
        );
      } else if (selectedGroup && selectedGroup?._id === newMessage?.groupId) {
        if (messages) {
          dispatch(setMessages([...messages, newMessage]));
        } else {
          dispatch(setMessages([newMessage]));
        }
      } else {
        // message senderId !== selectedUser._id
        // so set status delivered
        const updatedChats = chats.map((chat) => {
          if (chat._id === newMessage.conversationId) {
            return { ...chat, notification: (chat.notification || 0) + 1 };
          } else {
            return chat;
          }
        });
        dispatch(setChats(updatedChats));

        // emit delivered status when sender is not selected
        socket.emit(
          "new_message_status_update_from_receiver_to_backend",
          newMessage._id,
          newMessage.conversationId,
          "delivered"
        );
      }
    };

    // new message
    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [socket, messages, dispatch, chats]);

  // sender gets message status update from backend
  // send ny receiver
  // this code is used to update new message status or update all message status when receiver call getAllChats
  useEffect(() => {
    const handleMessageStatusUpdate = (conversationId, status) => {
      const updatedMessage = messages?.map((message) =>
        message.conversationId === conversationId && message.status !== "seen"
          ? { ...message, status: status }
          : message
      );
      dispatch(setMessages(updatedMessage));
    };
    socket.on(
      "message_status_update_from_backend_to_sender",
      handleMessageStatusUpdate
    );

    return () => {
      socket.off(
        "message_status_update_from_backend_to_sender",
        handleMessageStatusUpdate
      );
    };
  }, [socket, messages, dispatch]);
};
export default useGetRealTimeMessage;
