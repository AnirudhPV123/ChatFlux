import { setSelectedGroup, setSelectedUser, UserType } from "@/redux/userSlice";
import moment from "moment";
import { setSelectedChat } from "../../redux/userSlice";
import { useTypedDispatch, useTypedSelector } from "@/hooks/useRedux";
import { memo, useEffect } from "react";
import { ChatType } from "@/redux/chatSlice";

function Chat({ chat }: { chat: ChatType }) {
  const { authUser, onlineUsers } = useTypedSelector((store) => store.user);
  const dispatch = useTypedDispatch();
  const isGroupChat = chat?.isGroupChat;

  const user = isGroupChat
    ? null
    : chat.participants.find(
        (participant) => participant._id !== authUser?._id,
      );
  const isOnline = !isGroupChat && user && onlineUsers?.includes(user?._id);

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
      className="user mb-2 flex h-24 cursor-pointer items-center justify-between rounded-lg border border-gray-500 px-8 hover:bg-gray-600"
      onClick={handleSelectUser}
    >
      <div className="user-info flex h-full w-3/6 items-center gap-4">
        {/* conditional avatar setup */}
        {isGroupChat ? (
          <div className="flex aspect-square h-4/6 items-center justify-center rounded-full bg-primary">
            <h2 className="text-3xl font-semibold text-black">
              {chat?.groupName.charAt(0).toUpperCase()}
            </h2>
          </div>
        ) : (
          <div
            className={`avatar flex aspect-square h-4/6 items-center justify-center rounded-full bg-primary ${
              isOnline ? "online" : ""
            }`}
          >
            <div className="rounded-full">
              <img src={user?.avatar} alt="User Avatar" />
            </div>
          </div>
        )}

        <div>
          <h3 className="whitespace-nowrap text-lg font-semibold">
            {isGroupChat ? chat.groupName : user?.username}
          </h3>
          {/* <h4 className="text-sm text-gray-400">No messages yet</h4> */}
        </div>
      </div>
      <div className="message-info flex flex-col gap-2 text-xs">
        {chat?.lastMessageTime && (
          <div>
            <h4 className="text-green-500">{formattedTime}</h4>
          </div>
        )}
        {chat?.notification > 0 && (
          <div className="flex justify-end">
            <div className="flex h-4 min-w-4 items-center justify-center rounded-full bg-green-500 px-1">
              <small className="font-semibold text-black">
                {chat?.notification}
              </small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(Chat);
