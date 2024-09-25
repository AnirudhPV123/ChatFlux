import { ArrowBigLeft } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { setSelectedGroup, setSelectedUser } from "@/redux/userSlice";
import { getGroupMembersDetails } from "@/services/api/chat";
import { setGroupMembers } from "@/redux/temporarySlice";
import useGetAvailableUsers from "@/hooks/chat/useGetAvailableUsers";
import { useTypedDispatch, useTypedSelector } from "@/hooks/useRedux";
import Avatar from "../Avatar";
import ChatDetails from "./ChatDetails";
import VideoCall from "./VideoCall";

function ChatHeader() {
  useGetAvailableUsers();

  const { selectedUser, selectedGroup, onlineUsers } = useTypedSelector(
    (store) => store.user,
  );
  const { selectedChat } = useTypedSelector((store) => store.user);
  const [showChatDetails, setShowChatDetails] = useState(false);
  const [showAddUsersToGroup, setShowAddUsersToGroup] = useState(false);
  const dispatch = useTypedDispatch();
  const chatDetailsRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);

  const handleBackClick = useCallback(() => {
    dispatch(setSelectedUser(null));
    dispatch(setSelectedGroup(null));
  }, [dispatch]);

  const handleChatDetails = useCallback(async () => {
    setShowChatDetails((prev) => !prev);
    if (selectedChat?.isGroupChat) {
      const result = await getGroupMembersDetails(selectedChat._id);
      dispatch(setGroupMembers(result?.data?.data[0]));
    }
  }, [dispatch, selectedChat]);

  // Handle click outside of autocomplete to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        chatDetailsRef.current &&
        !chatDetailsRef.current.contains(event.target as Node) &&
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowChatDetails(false);
        setShowAddUsersToGroup(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const chatTitle = useMemo(() => {
    return selectedUser ? selectedUser.username : selectedGroup?.groupName;
  }, [selectedUser, selectedGroup]);

  const isUserOnline = useMemo(() => {
    return onlineUsers?.includes(selectedUser?._id as never)
      ? "Online"
      : "Offline";
  }, [onlineUsers, selectedUser]);

  return (
    <div className="relative">
      <div className="ml-4 flex flex-shrink-0 items-center border-b border-gray-700 py-2">
        <ArrowBigLeft
          className={`mr-1 size-8 cursor-pointer hover:text-gray-600 ${
            window.innerWidth < 640 ? "block" : "hidden"
          }`}
          onClick={handleBackClick}
        />
        <div
          className="mr-4 flex h-12 w-12 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-primary"
          ref={profileRef}
          onClick={handleChatDetails}
        >
          <Avatar
            isGroup={selectedGroup ? true : false}
            groupName={selectedGroup?.groupName}
            avatar={selectedUser?.avatar}
            size="h-12 w-12"
            username={selectedUser?.username}
          />
        </div>

        {/* dynamic setup username || groupName */}
        <div>
          <h2 className="font-semibold" onClick={handleChatDetails}>
            {chatTitle}
          </h2>
          {selectedUser && (
            <h4 className="text-xs text-gray-400">{isUserOnline}</h4>
          )}{" "}
        </div>

        <VideoCall />
      </div>

      {showChatDetails && (
        <ChatDetails
          showChatDetails={showChatDetails}
          chatDetailsRef={chatDetailsRef}
          showAddUsersToGroup={showAddUsersToGroup}
          setShowAddUsersToGroup={setShowAddUsersToGroup}
        />
      )}
    </div>
  );
}

export default memo(ChatHeader);
