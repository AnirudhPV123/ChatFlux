import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedGroup, setSelectedUser } from "../../redux/userSlice";
import moment from "moment";
import { setSelectedChat } from "../../redux/userSlice";

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
      dispatch(setSelectedChat(chat));

  };
  const formatLastMessageTime = (lastMessageTime) => {
    const messageTime = moment(lastMessageTime);
    const now = moment();

    if (now.diff(messageTime, "hours") < 24) {
      return messageTime.format("H:mm a"); // Show hour and minute if less than 24 hours
    } else if (48 > now.diff(messageTime, "hours") > 24) {
      return "Yesterday";
    } else {
      return messageTime.format("DD/MM/YYYY"); // Show date if 24 hours or more
    }
  };

  // Usage
  const lastMessageTime = chat?.lastMessageTime;
  const formattedTime = formatLastMessageTime(lastMessageTime);

  return (
    <div
      className="user h-24 border border-gray-500 rounded-lg flex items-center justify-between px-8 mb-2 cursor-pointer hover:bg-gray-600"
      onClick={handleSelectUser}
    >
      <div className="user-info w-3/6 h-full flex items-center gap-4">
        {/* conditional avatar setup */}
        {isGroupChat ? (
          <div className="rounded-full h-4/6 flex justify-center items-center aspect-square bg-primary">
            <h2 className="text-3xl text-black font-semibold">
              {chat?.groupName.charAt(0).toUpperCase()}
            </h2>
          </div>
        ) : (
          <div
            className={`rounded-full h-4/6 flex justify-center items-center aspect-square bg-primary avatar ${
              isOnline ? "online" : ""
            }`}
          >
            <div className="rounded-full">
              <img src={user?.avatar} alt="User Avatar" />
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold whitespace-nowrap">
            {isGroupChat ? chat.groupName : user?.userName}
          </h3>
          {/* <h4 className="text-sm text-gray-400">No messages yet</h4> */}
        </div>
      </div>
      <div className="message-info flex flex-col gap-2 text-xs ">
        {chat?.lastMessageTime && (
          <div>
            <h4 className="text-green-500">{formattedTime}</h4>
          </div>
        )}
        {chat?.notification > 0 && (
          <div className="flex justify-end">
            <div className="bg-green-500 px-1 h-4 min-w-4 rounded-full flex justify-center items-center">
              <small className="text-black font-semibold ">
                {chat?.notification}
              </small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
