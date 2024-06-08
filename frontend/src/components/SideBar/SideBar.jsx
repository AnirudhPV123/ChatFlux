import React from "react";
import SearchUserOrGroup from "./SearchUserOrGroup";
import AddChatBtn from "./AddChatBtn";
import AllChats from "./AllChats";
import { useSelector } from "react-redux";
import Settings from "./Settings";

function SideBar() {
  const { selectedUser, selectedGroup } = useSelector((store) => store.user);

  // used to dynamically show messageContainer or sideBar for smaller screen
  if (window.innerWidth < 640 && (selectedUser || selectedGroup)) return;

  return (
    <div
      className={`sidebar w-full sm:w-2/4 md:2/5 lg:w-1/3  h-[100vh] pb-6 border-r border-gray-700 overflow-hidden`}
    >
      <div className="add-chat flex gap-4 px-2 py-4">
        <MemoizedSearchUserOrGroup />
        <MemoizedAddChatBtn />
      </div>
      <AllChats />
      <Settings />
    </div>
  );
}

// prevent unwanted re-renders
const MemoizedSearchUserOrGroup = React.memo(SearchUserOrGroup);
const MemoizedAddChatBtn = React.memo(AddChatBtn);

export default SideBar;
