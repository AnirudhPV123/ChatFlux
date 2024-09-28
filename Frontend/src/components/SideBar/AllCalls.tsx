import { useTypedSelector } from "@/hooks/useRedux";
import Call from "./Call";
import { CallType } from "@/redux/callSlice";

function AllCalls() {
  const { calls } = useTypedSelector((store) => store.call);

  if (!calls || calls?.length === 0) {
    return (
      <div className="mx-4 h-[calc(100%-15vh)] overflow-auto scroll-smooth border-b border-gray-700">
        No Call yet.
      </div>
    );
  }

  return (
    <div
      id="users"
      className="h-[calc(100%-15vh)] overflow-auto scroll-smooth border-b border-gray-700 p-2"
    >
      {calls.map((call: CallType) => (
        <Call
          key={call?._id}
          callerId={call?.callerId}
          isAttend={call?.isAttend}
          isVideo={call?.isVideo}
          chatId={call?.conversationId}
          createdAt={call?.createdAt}
        />
      ))}
    </div>
  );
}

export default AllCalls;
