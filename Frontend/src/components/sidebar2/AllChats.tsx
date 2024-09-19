import { useTypedSelector } from "@/hooks/useRedux";
import React, { useMemo } from "react";
import Chat from "./Chat";

function AllChats() {
  const { chats } = useTypedSelector((store) => store.chat);
  const { chatSearch } = useTypedSelector((store) => store.temporary);

  const chatList = useMemo(() => {
    return chats?.map((chat) => {
      if (
        (chatSearch &&
          chatSearch.length > 0 &&
          chatSearch.find((cht) => cht?._id === chat?._id)) ||
        !chatSearch
      ) {
        return <Chat key={chat?._id} chat={chat} />;
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
      className="h-[calc(100%-15vh)] overflow-auto scroll-smooth border-b border-gray-700 p-2"
    >
      {chatList}
    </div>
  );
}

export default AllChats;
