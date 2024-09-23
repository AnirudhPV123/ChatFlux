import { useTypedDispatch, useTypedSelector } from "@/hooks/useRedux";
import { setMessageReplyDetails } from "@/redux/temporarySlice";
import { CircleX, Headphones } from "lucide-react";

function MessageReplyDetails() {
  const { messageReplyDetails } = useTypedSelector((store) => store.temporary);
  const dispatch = useTypedDispatch();
  if (!messageReplyDetails?.status) {
    return;
  }

  return (
    <div className="mt-4 flex w-full items-center justify-between pl-20 pr-4 transition-all duration-500">
      <div className="flex gap-2">
        <div className="h-14 overflow-hidden rounded-md">
          {messageReplyDetails?.messageToPopUp?.type === "image" ? (
            <img
              src={messageReplyDetails?.messageToPopUp?.content}
              alt=""
              className="aspect-square h-full object-cover"
            />
          ) : messageReplyDetails?.messageToPopUp?.type === "video" ? (
            <video className="aspect-square h-full object-cover">
              <source
                src={messageReplyDetails?.messageToPopUp?.content}
                type={`video/${messageReplyDetails?.messageToPopUp?.format}`}
              />
              Your browser does not support the video tag.
            </video>
          ) : messageReplyDetails?.messageToPopUp?.type === "audio" ? (
            <div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-600">
              <Headphones />
            </div>
          ) : (
            <div className="mr-4 flex h-full w-full items-center">
              <p>{messageReplyDetails?.messageToPopUp?.content}</p>
            </div>
          )}
        </div>

        <div>
          <p className="font-semibold text-primary">
            {"Reply to "}
            {messageReplyDetails?.senderUsername}
          </p>
          <p className="text-gray-200">
            {messageReplyDetails?.messageToPopUp?.type}
          </p>
        </div>
      </div>
      <CircleX
        className="cursor-pointer text-primary"
        onClick={() =>
          dispatch(
            setMessageReplyDetails({
              replyMessageId: null,
              replyMessageUserId: null,
              status: false,
            }),
          )
        }
      />
    </div>
  );
}

export default MessageReplyDetails;
