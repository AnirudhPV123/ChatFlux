import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setChats } from "../redux/chatSlice";
import { useSocket } from "../context/SocketContext";

const useGetRealTimeChat = () => {
  const { chats } = useSelector((store) => store.chat);
  const { authUser } = useSelector((store) => store.user);
  const socket = useSocket();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleNewChat = (newChat) => {
      if (chats) {
        dispatch(setChats([...chats, newChat]));
      } else {
        dispatch(setChats(newChat));
      }
    };

    if (socket) {
      socket.on("newChat", handleNewChat);
    }

    return () => {
      if (socket) {
        socket.off("newChat", handleNewChat);
      }
    };
  }, [dispatch, socket, chats]);

  // chat delete

  useEffect(() => {
    const handleChatDelete = (id) => {
      const updatedChats = chats.filter((chat) => chat?._id !== id);
      dispatch(setChats(updatedChats));
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

  // leave group
  useEffect(() => {
    const handleLeaveGroup = (userId, groupId) => {
      // const updatedChats =
      console.log("userId", userId);
      console.log("groupId", groupId);

      const updatedChats = chats.map((chat) =>
        chat?._id === groupId
          ? {
              ...chat,
              participants: chat.participants.filter((p) => p !== userId),
            }
          : chat
      );

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

  useEffect(() => {
    const handleRemoveUserFromGroup = (userId, groupId) => {
      // const updatedChats =
      console.log("authUserl",authUser?._id)
      console.log("userId", userId);
      console.log("groupId", groupId);

      let updatedChats;
      if (authUser?._id === userId) {
        updatedChats = chats.filter((chat) => chat?._id !== groupId);
      } else {
        updatedChats = chats.map((chat) =>
          chat?._id === groupId
            ? {
                ...chat,
                participants: chat.participants.filter((p) => p !== userId),
              }
            : chat
        );
      }

      console.log("updatedChats",updatedChats);
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

useEffect(() => {
  const handleAddUserToGroup = (userId, groupId) => {
    // const updatedChats =
    console.log("authUserl", authUser?._id);
    console.log("userId", userId);
    console.log("groupId", groupId);

    let updatedChats;

      updatedChats = chats.map((chat) =>
        chat?._id === groupId
          ? {
              ...chat,
              participants: [...chat.participants, userId],
            }
          : chat
      );

    dispatch(setChats(updatedChats));
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


};

export default useGetRealTimeChat;
