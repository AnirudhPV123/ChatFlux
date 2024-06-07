import Messages from "./Messages";
import ChatHeader from "./ChatHeader";
import SendInput from "./SendInput";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { setChats } from "../../redux/chatSlice";

function MessageContainer() {
  const { selectedUser, selectedGroup, authUser } = useSelector(
    (store) => store.user
  );

  const { chats } = useSelector((store) => store.chat);


const dispatch=useDispatch()

  // set notification of a specific chat to 0 when receiver selected that chat
  // receiver
//   useEffect(() => {
//     if (!chats || !selectedUser) return;
//     console.log(chats);
//     console.log(selectedUser);

//     console.log(chats)
//     const updatedChats = chats?.map((chat) => {
//       // const participants = chat?.participants;
//       // if (
//       //   participants &&
//       //   chat?.conversationId &&
//       //   (participants[0]?._id === selectedUser?._id ||
//       //     participants[1]?._id === selectedUser?._id)
//       // ) {
//       // chat?.participants.include(selectedUser?._id)

//       console.log("parti",chat?.participants)
//       const check = chat?.participants.some(
//         (participant) => participant?._id === selectedUser?._id
//       );


//       console.log("truehai:",check)

// // console.log("check1", chat?.participants[0]?._id === selectedUser?._id);
// // console.log("check2", chat?.participants[1]?._id === selectedUser?._id);


//         return { ...chat, notification: 0 };
//       // }
//       // return chat;
//     });

//     console.log(updatedChats);

//     dispatch(setChats(updatedChats));
//   }, [selectedUser]);

  if (!selectedUser && !selectedGroup) {
    return (
      <div className="w-2/3 h-[100vh] flex flex-col justify-center">
        <h1 className="text-4xl font-semibold text-center mb-2">
          Hi, {authUser?.userName}{" "}
        </h1>
        <h1 className="text-xl text-center">Let's start your conversation</h1>
      </div>
    );
  }

  return (
    <div className=" w-2/3  h-[100vh]">
      <ChatHeader />
      <Messages />
      <SendInput />
    </div>
  );
}

export default MessageContainer;
