import { useMemo } from "react";
import Chat from "./Chat";
import { useTypedSelector } from "@/hooks/useRedux";
import useGetAllChats from "@/hooks/chat/useGetAllChats";
import { ChatType } from "@/redux/chatSlice";

function AllChats() {
  useGetAllChats();

  const { chats } = useTypedSelector((store) => store.chat);
  const { chatSearch } = useTypedSelector((store) => store.temporary);
  console.log("chats asll", chats);

  const chatList = useMemo(() => {
    return chats?.map((chat: { _id: string }) => {
      if (
        (chatSearch &&
          chatSearch.length > 0 &&
          chatSearch.find((cht: ChatType) => cht?._id === chat?._id)) ||
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
