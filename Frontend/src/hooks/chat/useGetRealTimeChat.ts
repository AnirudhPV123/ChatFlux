import { useEffect } from "react";
import { ChatType, setChats } from "@/redux/chatSlice";
import { useSocket } from "@/context/SocketContext";
import { useTypedDispatch, useTypedSelector } from "../useRedux";
import { setGroupMembers } from "@/redux/temporarySlice";
import { getGroupMembersDetails } from "@/services/api/chat";
import { setSelectedGroup, setSelectedUser } from "@/redux/userSlice";

const useGetRealTimeChat = () => {
  const { chats } = useTypedSelector((store) => store.chat);
  const { authUser } = useTypedSelector((store) => store.user);
  const { groupMembers } = useTypedSelector((store) => store.temporary);
  const dispatch = useTypedDispatch();
  const socket = useSocket();

  useEffect(() => {
    const handleNewChat = (newChat: ChatType) => {
      console.log("newChat hi bently", newChat);
      if (chats) {
        dispatch(setChats([...chats, newChat]));
      } else {
        dispatch(setChats(newChat));
      }
    };

    if (socket) {
      socket.on("new-chat", handleNewChat);
    }

    return () => {
      if (socket) {
        socket.off("new-chat", handleNewChat);
      }
    };
  }, [dispatch, socket, chats]);

  useEffect(() => {
    const handleChatDelete = (id: string) => {
      console.log("id:", id);

      const updatedChats = chats.filter((chat: ChatType) => chat?._id !== id);
      dispatch(setChats(updatedChats));
      dispatch(setSelectedUser(null));
    };

    if (socket) {
      socket.on("chat_deleted", handleChatDelete);
    }

    return () => {
      if (socket) {
        socket.off("chat_deleted", handleChatDelete);
      }
    };
  }, [dispatch, socket, chats]);

  useEffect(() => {
    const handleRemoveUserFromGroup = async (userId, groupId) => {
      console.log("userId", userId);
      console.log("groupId", groupId);

      let updatedChats;
      if (authUser?._id === userId) {
        updatedChats = chats.filter((chat) => chat?._id !== groupId);
        dispatch(setSelectedGroup(null));
      } else {
        updatedChats = chats.map((chat) =>
          chat?._id === groupId
            ? {
                ...chat,
                participants: chat.participants.filter((p) => p !== userId),
              }
            : chat,
        );

        const result = await getGroupMembersDetails(groupId);
        dispatch(setGroupMembers(result?.data?.data[0]));
      }

      console.log("updatedChats", updatedChats);
      dispatch(setChats(updatedChats));
    };

    if (socket) {
      socket.on("remove-user-from-group", handleRemoveUserFromGroup);
    }

    return () => {
      if (socket) {
        socket.off("remove-user-from-group", handleRemoveUserFromGroup);
      }
    };
  }, [dispatch, socket, chats]);

  useEffect(() => {
    const handleAddUserToGroup = async (userId, groupId) => {
      console.log("authUserl", authUser?._id);
      console.log("userId", userId);
      console.log("groupId", groupId);

      let result;

      if (authUser?._id === userId) {
        // groupid is actually full group object only for the created new user
        dispatch(setChats([...chats, groupId]));
        result = await getGroupMembersDetails(groupId._id);
      } else {
        const updatedChats = chats.map((chat) =>
          chat?._id === groupId
            ? {
                ...chat,
                participants: [...chat.participants, userId],
              }
            : chat,
        );

        dispatch(setChats(updatedChats));
        result = await getGroupMembersDetails(groupId);
      }

      dispatch(setGroupMembers(result?.data?.data[0]));
    };

    if (socket) {
      socket.on("add-user-to-group", handleAddUserToGroup);
    }

    return () => {
      if (socket) {
        socket.off("add-user-to-group", handleAddUserToGroup);
      }
    };
  }, [dispatch, socket, chats]);

  // leave group
  useEffect(() => {
    const handleLeaveGroup = async (userId, groupId) => {
      // const updatedChats =
      console.log("userId", userId);
      console.log("groupId", groupId);

      const updatedChats = chats.map((chat) =>
        chat?._id === groupId
          ? {
              ...chat,
              participants: chat.participants.filter((p) => p !== userId),
            }
          : chat,
      );

      const result = await getGroupMembersDetails(groupId);
      console.log(result);
      console.log("result?.data?.data[0]", result?.data?.data[0]);
      dispatch(setGroupMembers(result?.data?.data[0]));

      console.log(updatedChats);
      dispatch(setChats(updatedChats));
    };

    if (socket) {
      socket.on("leave-group", handleLeaveGroup);
    }

    return () => {
      if (socket) {
        socket.off("leave-group", handleLeaveGroup);
      }
    };
  }, [dispatch, socket, chats]);

  // almost same has handleLeaveGroup
  useEffect(() => {
    const handleDeleteGroup = (groupId) => {
      const updatedChats = chats.filter((chat) => chat?._id !== groupId);

      console.log(updatedChats);
      dispatch(setChats(updatedChats));
    };

    if (socket) {
      socket.on("delete-group", handleDeleteGroup);
    }

    return () => {
      if (socket) {
        socket.off("delete-group", handleDeleteGroup);
      }
    };
  }, [dispatch, socket, chats]);
};

export default useGetRealTimeChat;
