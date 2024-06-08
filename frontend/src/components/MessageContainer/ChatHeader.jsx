import { ArrowBigLeft } from "lucide-react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedGroup, setSelectedUser } from "../../redux/userSlice";

function ChatHeader() {
  const { selectedUser, selectedGroup, onlineUsers } = useSelector(
    (store) => store.user
  );

  const dispatch=useDispatch()

  const handleBackClick=()=>{
    dispatch(setSelectedUser(null))
    dispatch(setSelectedGroup(null))
  }

  return (
    <div className="h-[10%] flex items-center  border-b border-gray-700 ml-4">
      <ArrowBigLeft className={`size-8 mr-1 cursor-pointer hover:text-gray-600 ${window.innerWidth<640 ? "block" :'hidden'}`}  onClick={handleBackClick}/>
      <div className="w-16 h-16 rounded-full flex items-center justify-center bg-primary mr-4">
        {/* conditional avatar setup */}
        {selectedUser && <img src={selectedUser?.avatar} alt="" />}
        {selectedGroup && (
          <h2 className="text-3xl text-black font-semibold">
            {selectedGroup?.groupName.charAt(0).toUpperCase()}
          </h2>
        )}
      </div>

      {/* dynamic setup userName || groupName */}
      <div>
        <h2 className="text-lg font-semibold">
          {selectedUser ? selectedUser?.userName : selectedGroup?.groupName}
        </h2>
        {selectedUser && (
          <h4 className="text-sm text-gray-400">
            {onlineUsers?.includes(selectedUser?._id) ? "Online" : "Offline"}
          </h4>
        )}{" "}
      </div>
    </div>
  );
}

export default ChatHeader;
