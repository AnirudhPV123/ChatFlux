import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import Chat from "./Chat";
import useGetAllChats from "../../hooks/useGetAllChats";

function AllChats() {
  useGetAllChats();
  const { chats } = useSelector((store) => store.chat);
  const {chatSearch} = useSelector(store=>store.temporary)

  const chatList = useMemo(() => {
    console.log("chatSE",chatSearch)
    return chats?.map((chat) => {
      if ((chatSearch && chatSearch.length >0 && chatSearch.find((cht)=>cht?._id === chat?._id)) || !chatSearch) {
        return <MemoizedChat key={chat?._id} chat={chat} />;
      }
    });
  }, [chats, chatSearch]);

  if (!chats || chats?.length === 0) {
    return (
      <div className="mx-4 h-[calc(100%-15vh)] overflow-auto scroll-smooth border-b border-gray-700">
        No Chat yet.
      </div>
    );
  }

  return (
    <div
      id="users"
      className="p-2 h-[calc(100%-15vh)] overflow-auto scroll-smooth border-b border-gray-700"
    >
      {chatList}
    </div>
  );
}

const MemoizedChat = React.memo(Chat);

export default AllChats;
