import React from "react";
import SearchUserOrGroup from "./SearchUserOrGroup";
import AddChatBtn from "./AddChatBtn";
import Settings from "./Settings";
import BottomBar from "./BottomBar";
import AllChats from "./AllChats";

function SideBar() {
  return (
    <div
      className={`sidebar md:2/5 h-[100vh] w-full overflow-hidden border-r border-gray-700 pb-6 sm:w-2/4 lg:w-1/3`}
    >
      <div className="add-chat flex gap-4 px-2 py-4">
        <SearchUserOrGroup />
        <AddChatBtn />
      </div>
      <AllChats />
      <BottomBar />
    </div>
  );
}

export default SideBar;
