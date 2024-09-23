import { useEffect } from "react";
import { ChatType, setChats } from "@/redux/chatSlice";
import { useSocket } from "@/context/SocketContext";
import { useTypedDispatch, useTypedSelector } from "../useRedux";
import { setGroupMembers } from "@/redux/temporarySlice";
import { getGroupMembersDetails } from "@/services/api/chat";
import { setSelectedGroup, setSelectedUser } from "@/redux/userSlice";

const useGetRealTimeChat = () => {
  const { chats } = useTypedSelector((store) => store.chat);
  const { authUser, selectedGroup } = useTypedSelector((store) => store.user);
  const dispatch = useTypedDispatch();
  const socket = useSocket();

  useEffect(() => {
    const handleNewChat = (newChat: ChatType) => {
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
    const handleRemoveUserFromGroup = async (
      userId: string,
      groupId: string,
    ) => {
      let updatedChats;
      if (authUser?._id === userId) {
        updatedChats = chats.filter((chat: ChatType) => chat?._id !== groupId);
        dispatch(setSelectedGroup(null));
      } else {
        updatedChats = chats.map((chat: ChatType) =>
          chat?._id === groupId
            ? {
                ...chat,
                participants: chat.participants.filter(
                  (p) => p.toString() !== userId,
                ),
              }
            : chat,
        );

        const result = await getGroupMembersDetails(groupId);
        dispatch(setGroupMembers(result?.data?.data[0]));
      }

      dispatch(setChats(updatedChats));

      if (selectedGroup?._id === groupId && authUser?._id === userId) {
        dispatch(setSelectedGroup(null));
      }
    };

    if (socket) {
      socket.on("remove-user-from-group", handleRemoveUserFromGroup);
    }

    return () => {
      if (socket) {
        socket.off("remove-user-from-group", handleRemoveUserFromGroup);
      }
    };
  }, [dispatch, socket, chats, authUser, selectedGroup]);

  useEffect(() => {
    const handleAddUserToGroup = async (userId: string, groupId: any) => {
      let result;

      if (authUser?._id === userId) {
        // groupid is full group object only for the created new user and for others gropupId is string
        dispatch(setChats([...chats, groupId]));
        result = await getGroupMembersDetails(groupId._id);
      } else {
        const updatedChats = chats.map((chat: ChatType) =>
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
  }, [dispatch, socket, chats, authUser]);

  // leave group
  useEffect(() => {
    const handleLeaveGroup = async (userId: string, groupId: string) => {
      const updatedChats = chats.map((chat: ChatType) =>
        chat?._id === groupId
          ? {
              ...chat,
              participants: chat.participants.filter(
                (p) => p.toString() !== userId,
              ),
            }
          : chat,
      );

      const result = await getGroupMembersDetails(groupId);

      dispatch(setGroupMembers(result?.data?.data[0]));

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
    const handleDeleteGroup = (groupId: string) => {
      const updatedChats = chats.filter(
        (chat: ChatType) => chat?._id !== groupId,
      );

      dispatch(setChats(updatedChats));
      if (selectedGroup?._id === groupId) {
        dispatch(setSelectedGroup(null));
      }
    };

    if (socket) {
      socket.on("delete-group", handleDeleteGroup);
    }

    return () => {
      if (socket) {
        socket.off("delete-group", handleDeleteGroup);
      }
    };
  }, [dispatch, socket, chats, selectedGroup]);
};

export default useGetRealTimeChat;
