import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import Chat from "./Chat";
import useGetAllChats from "../../hooks/useGetAllChats";
import useGetRealTimeChat from "../../hooks/useGetRealTimeChat";

function AllChats() {
  useGetAllChats();
  useGetRealTimeChat();
  const { chats } = useSelector((store) => store.chat);

  const chatList = useMemo(() => {
    return chats?.map((chat) => <MemoizedChat key={chat._id} chat={chat} />);
  }, [chats]);

  if (!chats || chats.length === 0) {
    return <div className="mx-4">No Chat yet.</div>;
  }

  return (
    <div
      id="users"
      className="p-2 h-[calc(100%-10vh)] overflow-auto scroll-smooth"
    >
      {chatList}
    </div>
  );
}

const MemoizedChat = React.memo(Chat);

export default AllChats;
