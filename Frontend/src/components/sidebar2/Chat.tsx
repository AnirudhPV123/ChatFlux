import { useTypedDispatch } from "@/hooks/useRedux";

function Chat({ chat }) {
  const dispatch = useTypedDispatch()
  const handleSelectChat = () => {
    if(chat.isGroupChat === false){
      dispatch(setSelected)
    }else{
    }
  };

  return (
    <div
      className="user mb-2 flex h-24 cursor-pointer items-center justify-between rounded-lg border border-gray-500 px-8 hover:bg-gray-600"
      onClick={handleSelectChat}
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
            {isGroupChat ? chat.groupName : user?.userName}
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

export default Chat;
