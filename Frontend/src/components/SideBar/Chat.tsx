import { setSelectedGroup, setSelectedUser, UserType } from "@/redux/userSlice";
import moment from "moment";
import { setSelectedChat } from "@/redux/userSlice";
import { useTypedDispatch, useTypedSelector } from "@/hooks/useRedux";
import { memo, useMemo } from "react";
import { ChatType } from "@/redux/chatSlice";
import Avatar from "../Avatar";

function Chat({ chat }: { chat: ChatType }) {
  const { authUser, onlineUsers } = useTypedSelector((store) => store.user);
  const dispatch = useTypedDispatch();
  const isGroupChat = chat?.isGroupChat;

  const user = useMemo(() => {
    return isGroupChat
      ? null
      : chat.participants.find(
          (participant: UserType) => participant._id !== authUser?._id,
        );
  }, [isGroupChat, chat.participants, authUser]);

  const isOnline = useMemo(() => {
    return !isGroupChat && user && onlineUsers?.includes(user._id as never);
  }, [isGroupChat, user, onlineUsers]);

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
  const formatLastMessageTime = (lastMessageTime: string) => {
    const messageTime = moment(lastMessageTime);
    const now = moment();

    if (now.diff(messageTime, "hours") < 24) {
      return messageTime.format("H:mm a"); // Show hour and minute if less than 24 hours
    } else if (now.diff(messageTime, "hours") < 48) {
      return "Yesterday";
    } else {
      return messageTime.format("DD/MM/YYYY");
    }
  };

  // Usage
  const formattedTime = useMemo(
    () => formatLastMessageTime(chat?.lastMessageTime),
    [chat?.lastMessageTime],
  );

  return (
    <div
      className="user mb-2 flex h-24 cursor-pointer items-center justify-between rounded-lg border border-gray-500 px-8 hover:bg-gray-600"
      onClick={handleSelectUser}
    >
      <div className="user-info flex h-full w-3/6 items-center gap-4">
        <Avatar
          size="h-14 w-14"
          avatar={user?.avatar}
          groupName={chat?.groupName}
          isGroup={isGroupChat}
          isOnline={isOnline || false}
          username={user?.username}
        />

        <div>
          <h3 className="whitespace-nowrap text-lg font-semibold">
            {isGroupChat ? chat.groupName : user?.username}
          </h3>
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
