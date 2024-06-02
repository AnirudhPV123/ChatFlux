import React from "react";
import SearchUserOrGroup from "./SearchUserOrGroup";
import AddChatBtn from "./AddChatBtn";
import AllChats from "./AllChats";
import { useDispatch } from "react-redux";
import { setResetState } from "../../redux/userSlice";

function SideBar() {
  const dispatch = useDispatch()
  return (
    <div className="sidebar w-1/3  h-[100vh] pb-6 border-r border-gray-700">
      <div className="add-chat flex gap-4 px-2 py-4">
        <MemoizedSearchUserOrGroup />
        <MemoizedAddChatBtn />
      </div>
      <AllChats />
      <button className="btn btn-primary" onClick={()=>dispatch(setResetState())}>Logout</button>
    </div>
  );
}

// prevent unwanted re-renders
const MemoizedSearchUserOrGroup = React.memo(SearchUserOrGroup);
const MemoizedAddChatBtn = React.memo(AddChatBtn);

export default SideBar;
