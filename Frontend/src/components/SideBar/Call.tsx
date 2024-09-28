import { useTypedSelector } from "@/hooks/useRedux";
import Avatar from "../Avatar";
import { useMemo } from "react";
import { ChatType } from "@/redux/chatSlice";
import { SlCallIn, SlCallOut } from "react-icons/sl";
import { MdMissedVideoCall } from "react-icons/md";
import moment from "moment";
import { UserType } from "@/redux/userSlice";

type CallProps = {
  callerId: string;
  isAttend: boolean;
  isVideo: boolean;
  createdAt: string;
  chatId: string;
};

function Call({ callerId, isAttend, isVideo, chatId, createdAt }: CallProps) {
  const { authUser } = useTypedSelector((store) => store.user);
  const { chats } = useTypedSelector((store) => store.chat);

  const user = useMemo(() => {
    const chat = chats.filter((chat: ChatType) => chat._id === chatId);

    const userArray = chat[0].participants?.filter(
      (particpant: UserType) => particpant._id !== authUser?._id,
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
    </div>
  );
}

export default Call;
