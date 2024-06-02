import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedGroup, setSelectedUser } from "../../redux/userSlice";

function Chat({ chat }) {
  const { authUser, onlineUsers } = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const isGroupChat = chat?.isGroupChat;

  const user = isGroupChat
    ? null
    : chat.participants.find(
        (participant) => participant._id !== authUser?._id
      );
  const isOnline = user && onlineUsers?.includes(user._id);

  const handleSelectUser = () => {
    // conditional setup selectedUser or selectedGroup
    if (chat.isGroupChat === false) {
      dispatch(setSelectedUser(user));
      dispatch(setSelectedGroup(null));
    } else {
      dispatch(setSelectedGroup(chat));
      dispatch(setSelectedUser(null));
    }
  };

  return (
    <div
      className="user h-24 border border-gray-500 rounded-lg flex items-center justify-between px-8 mb-2 cursor-pointer"
      onClick={handleSelectUser}
    >
      <div className="user-info w-3/6 h-full flex items-center gap-4">
        {/* conditional avatar setup */}
        {isGroupChat ? (
          <div className="rounded-full h-4/6 flex justify-center items-center aspect-square overflow-hidden bg-primary">
            <h2 className="text-3xl text-black font-semibold">
              {chat?.groupName.charAt(0).toUpperCase()}
            </h2>
          </div>
        ) : (
          <div className={`avatar h-4/6  ${isOnline ? "online" : ""}`}>
            <div className="rounded-full">
              <img src={user?.avatar} alt="User Avatar" />
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold">
            {isGroupChat ? chat.groupName : user?.userName}
          </h3>
          <h4 className="text-sm text-gray-400">No messages yet</h4>
        </div>
      </div>
      <div className="message-info flex flex-col gap-2 text-xs">
        <div>
          <h4 className="text-gray-400">a few seconds ago</h4>
        </div>
        <div className="flex justify-end">
          <div className="bg-green-500 w-4 h-4 rounded-full flex justify-center items-center">
            <small className="text-white ">1</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
