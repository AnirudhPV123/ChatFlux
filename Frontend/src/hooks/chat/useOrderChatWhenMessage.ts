import { useTypedDispatch, useTypedSelector } from "../useRedux";
import { setChats } from "@/redux/chatSlice";

function useOrderChatWhenMessage() {
  const { chats } = useTypedSelector((store) => store.chat);
  const { selectedChat } = useTypedSelector((store) => store.user);
  const filterdChats = chats.filter((chat) => chat?._id !== selectedChat?._id);

  const dispatch = useTypedDispatch();

  return function updateChats() {
    const updatedChats = [selectedChat, ...filterdChats];
    dispatch(setChats(updatedChats));
  };
}

export default useOrderChatWhenMessage;
