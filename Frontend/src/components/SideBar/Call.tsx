import { useTypedSelector } from "@/hooks/useRedux";
import Avatar from "../Avatar";
import { UserType } from "@/redux/userSlice";
import { useMemo } from "react";
import { ChatType } from "@/redux/chatSlice";
import { SlCallIn, SlCallOut } from "react-icons/sl";
import { IoCall } from "react-icons/io5";
import { MdMissedVideoCall } from "react-icons/md";
import moment from "moment";

function Call({ callerId, attenderId, isAttend, isVideo, chatId, createdAt }) {
  const { authUser } = useTypedSelector((store) => store.user);
  const { chats } = useTypedSelector((store) => store.chat);

  const user = useMemo(() => {
    const chat = chats.filter((chat: ChatType) => chat._id === chatId);

    console.log(chats);
    console.log(chatId);
    console.log("chat", chat);
    const userArray = chat[0].participants?.filter(
      (particpant) => particpant._id !== authUser?._id,
    );

    return userArray[0];
  }, [authUser?._id, chatId, chats]);

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

  console.log("console", isAttend);

  return (
    <div className="user mb-2 flex h-24 cursor-pointer items-center justify-between rounded-lg border border-gray-500 px-8 hover:bg-gray-600">
      <div className="user-info flex h-full items-center gap-4">
        <Avatar
          size="h-14 w-14"
          avatar={user?.avatar}
          isGroup={false}
          username={user?.username}
        />

        <div>
          <h3 className="whitespace-nowrap text-lg font-semibold">
            {user?.username}
          </h3>
          <p
            className={`flex items-center gap-2 text-sm font-semibold ${!isAttend && "text-red-500"}`}
          >
            {callerId === authUser?._id && !isVideo ? (
              <SlCallOut />
            ) : !isVideo ? (
              <SlCallIn />
            ) : (
              <MdMissedVideoCall className="size-5" />
            )}
            {callerId === authUser?._id
              ? "Outgoing"
              : isAttend
                ? "Incoming"
                : "Missed"}
          </p>
        </div>
      </div>
      <p className="text-sm"> {formatLastMessageTime(createdAt)}</p>

      {/* <div className="message-info flex flex-col gap-2 text-xs">
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
      </div> */}
    </div>
  );
}

export default Call;
