import React from "react";
import SearchUserOrGroup from "./SearchUserOrGroup";
import AddChatBtn from "./AddChatBtn";
import AllChats from "./AllChats";
import { useDispatch } from "react-redux";
import { setResetUserState } from "../../redux/userSlice";
import { logoutUser } from "../../api/user";
import { setResetMessagesState } from "../../redux/messageSlice";
import { setResetChatsState } from "../../redux/chatSlice";

function SideBar() {
  const dispatch = useDispatch()
  const handleLogout=async()=>{
    await logoutUser()
    dispatch(setResetUserState())
    dispatch(setResetMessagesState())
    dispatch(setResetChatsState())
  }
  return (
    <div className="sidebar w-1/3  h-[100vh] pb-6 border-r border-gray-700">
      <div className="add-chat flex gap-4 px-2 py-4">
        <MemoizedSearchUserOrGroup />
        <MemoizedAddChatBtn />
      </div>
      <AllChats />
      <button className="btn btn-primary" onClick={handleLogout}>Logout</button>
    </div>
  );
}

// prevent unwanted re-renders
const MemoizedSearchUserOrGroup = React.memo(SearchUserOrGroup);
const MemoizedAddChatBtn = React.memo(AddChatBtn);

export default SideBar;
