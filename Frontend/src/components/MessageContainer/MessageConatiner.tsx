// import Messages from "./Messages";
import ChatHeader from "./ChatHeader";
// import SendInput from "./SendInput";
import { useTypedSelector } from "@/hooks/useRedux";


function MessageContainer() {
  const { selectedUser, selectedGroup, authUser } = useTypedSelector(
    (store) => store.user,
  );

  // used to dynamically show messageContainer or sideBar for smaller screen
  if (window.innerWidth < 640 && !selectedUser && !selectedGroup) return;

  if (!selectedUser && !selectedGroup) {
    return (
      <div className="flex h-[100vh] w-full flex-col justify-center sm:w-2/4 md:w-3/5 lg:w-2/3">
        <h1 className="mb-2 text-center text-4xl font-semibold">
          Hi, {authUser?.username}{" "}
        </h1>
        <h1 className="text-center text-xl">Let's start your conversation</h1>
      </div>
    );
  }

  return (
    <div className={`flex h-screen w-full flex-col sm:w-2/4 md:w-3/5 lg:w-2/3`}>
      <ChatHeader />
      {/* 
      <Messages />
      <SendInput />
       */}

    </div>
  );
}

export default MessageContainer;
