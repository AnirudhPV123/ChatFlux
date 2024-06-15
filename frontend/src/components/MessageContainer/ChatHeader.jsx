import { ArrowBigLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedGroup, setSelectedUser } from "../../redux/userSlice";
import {  deleteChat } from "../../api/chat";
import toast from "react-hot-toast";
import { setChats } from "../../redux/chatSlice";

function ChatHeader() {
  const { selectedUser, selectedGroup, onlineUsers } = useSelector(
    (store) => store.user
  );
  const { chats } = useSelector((store) => store.chat);

  const { selectedChat } = useSelector((store) => store.user);

  const [showChatDetails, setShowChatDetails] = useState(false);

  const dispatch = useDispatch();

  const handleBackClick = () => {
    dispatch(setSelectedUser(null));
    dispatch(setSelectedGroup(null));
  };

  const handleDeleteChat = async () => {
    try {
      const result = await deleteChat(selectedChat?._id);
      if (selectedUser) dispatch(setSelectedUser(null));
      else dispatch(setSelectedGroup(null));

      const updatedChats = chats.filter(
        (chat) => chat?._id !== result?.data?.data?._id
      );
      console.log("updtedcha", updatedChats);
      dispatch(setChats(updatedChats));
    } catch (error) {
      toast.error("Something went wrong");
    }
  };


  return (
    <div className="relative">
      <div className="flex items-center  border-b border-gray-700 ml-4 flex-shrink-0 py-2">
        <ArrowBigLeft
          className={`size-8 mr-1 cursor-pointer hover:text-gray-600 ${
            window.innerWidth < 640 ? "block" : "hidden"
          }`}
          onClick={handleBackClick}
        />
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary mr-4 cursor-pointer">
          {/* conditional avatar setup */}
          {selectedUser && (
            <img
              src={selectedUser?.avatar}
              alt=""
              onClick={() => setShowChatDetails(true)}
            />
          )}
          {selectedGroup && (
            <h2
              className="text-2xl text-black font-semibold "
              onClick={() => setShowChatDetails(true)}
            >
              {selectedGroup?.groupName.charAt(0).toUpperCase()}
            </h2>
          )}
        </div>

        {/* dynamic setup userName || groupName */}
        <div>
          <h2
            className="font-semibold cursor-pointer hover:font-bold hover:text-xl duration-200"
            onClick={() => setShowChatDetails((prev) => !prev)}
          >
            {selectedUser ? selectedUser?.userName : selectedGroup?.groupName}
          </h2>
          {selectedUser && (
            <h4 className="text-xs text-gray-400">
              {onlineUsers?.includes(selectedUser?._id) ? "Online" : "Offline"}
            </h4>
          )}{" "}
        </div>
      </div>
      {showChatDetails && (
        <div
          className={`bg-[#1D232A] border border-gray-600 absolute z-50 p-4 min-w-72 rounded-lg duration-700 ${
            showChatDetails ? "" : " overflow-hidden"
          }`}
        >
          <div className="absolute bg-[#1D232A] border-t border-l border-gray-600 -top-2 w-4 rotate-45 h-4"></div>

          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-primary cursor-pointer">
              {/* conditional avatar setup */}
              {selectedUser && <img src={selectedUser?.avatar} alt="" />}
              {selectedGroup && (
                <h2 className="text-3xl text-black font-semibold ">
                  {selectedGroup?.groupName.charAt(0).toUpperCase()}
                </h2>
              )}
            </div>
          </div>
          <div className="flex flex-col w-full items-center mt-2">
            <h3 className="font-bold text-xl">
              {selectedUser ? selectedUser.userName : selectedGroup.groupName}
            </h3>
            <p className="text-gray-400">example@gmail.com</p>
          </div>
          <button
            className="btn btn-outline btn-error w-full mt-4"
            onClick={handleDeleteChat}
          >
            Delete conversation
          </button>
        </div>
      )}
    </div>
  );
}

export default ChatHeader;
