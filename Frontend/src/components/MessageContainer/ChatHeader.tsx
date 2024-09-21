import { ArrowBigLeft, Trash2, UserPlus } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import {
  setSelectedChat,
  setSelectedGroup,
  setSelectedUser,
} from "@/redux/userSlice";
import {
  addUserToGroup,
  deleteChat,
  deleteGroup,
  getGroupMembersDetails,
  leaveGroup,
  removeUserFromGroup,
} from "@/services/api/chat";
import toast from "react-hot-toast";
import { setChats } from "@/redux/chatSlice";
import { setGroupMembers } from "@/redux/temporarySlice";
import useGetAvailableUsers from "@/hooks/chat/useGetAvailableUsers";
import { useTypedDispatch, useTypedSelector } from "@/hooks/useRedux";


function ChatHeader() {
  useGetAvailableUsers();

  const { selectedUser, selectedGroup, onlineUsers, authUser, availableUsers } =
    useTypedSelector((store) => store.user);
  const { chats } = useTypedSelector((store) => store.chat);

  const { selectedChat } = useTypedSelector((store) => store.user);

  const { groupMembers } = useTypedSelector((store) => store.temporary);

  const [showChatDetails, setShowChatDetails] = useState(false);
  const [showAddUsersToGroup, setShowAddUsersToGroup] = useState(false);

  const dispatch = useTypedDispatch();
  const chatDetailsRef = useRef(null);
  const profilRef = useRef(null);

  const handleBackClick = () => {
    dispatch(setSelectedUser(null));
    dispatch(setSelectedGroup(null));
  };

  const handleChatDetails = async () => {
    setShowChatDetails((prev) => !prev);
    if (
      selectedChat?.isGroupChat &&
      (selectedChat?._id !== groupMembers?._id || !groupMembers)
    ) {
      const result = await getGroupMembersDetails(selectedChat?._id);
      console.log(result);
      console.log("result?.data?.data[0]", result?.data?.data[0]);
      dispatch(setGroupMembers(result?.data?.data[0]));
    }
  };

  // Handle click outside of autocomplete to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        chatDetailsRef.current &&
        !chatDetailsRef.current.contains(event.target) &&
        profilRef.current &&
        !profilRef.current.contains(event.target)
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

  // almost same code as handleRemoveUserFromGroup
  const handleLeaveGroup = async () => {
    try {
      const result = await leaveGroup(selectedChat?._id);

      const updatedChats = chats.filter(
        (chat) => chat?._id !== result?.data?.data?.groupId,
      );
      dispatch(setChats(updatedChats));
      toast.success(`You have leaved from ${selectedChat?.groupName}`);
      dispatch(setSelectedGroup(null));
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleDeleteOneOnOneChat = async () => {
    try {
      const result = await deleteChat(selectedChat?._id, selectedUser?._id);

      const updatedChats = chats.filter(
        (chat) => chat?._id !== result?.data?.data?._id,
      );
      dispatch(setChats(updatedChats));
      toast.success(`You have deleted ${selectedUser?.username}`);
      dispatch(setSelectedUser(null));
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleDeleteGroup = async () => {
    try {
      const result = await deleteGroup(selectedChat?._id);

      const updatedChats = chats.filter(
        (chat) => chat?._id !== result?.data?.data?.groupId,
      );
      dispatch(setChats(updatedChats));
      toast.success(`You have deleted ${selectedChat?.groupName}`);
      dispatch(setSelectedGroup(null));
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleRemoveUserFromGroup = async (userId, username) => {
    try {
      const result = await removeUserFromGroup(selectedChat?._id, userId);
      console.log("result hei", result);

      const updatedChats = chats.map((chat) =>
        chat?._id === selectedChat?._id
          ? {
              ...chat,
              participants: chat.participants.filter((p) => p !== userId),
            }
          : chat,
      );

      const updatedGroupMembers = groupMembers.membersDetails.filter(
        (member) => member?._id !== userId,
      );

      console.log("updatedGrouMembners", updatedGroupMembers);

      dispatch(
        setGroupMembers({
          ...groupMembers,
          membersDetails: updatedGroupMembers,
        }),
      );

      console.log("fuck", updatedChats);
      dispatch(setChats(updatedChats));
      toast.success(
        `You have removed ${username} from ${selectedChat?.groupName}`,
      );
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleAddUsersToGroup = async (userId, username) => {
    try {
      const result = await addUserToGroup(selectedChat?._id, userId);

      const updatedChats = chats.map((chat) =>
        chat?._id === selectedChat?._id
          ? {
              ...chat,
              participants: [...chat.participants, userId],
            }
          : chat,
      );

      // this is good code but we need user details when optimization make a function to get individual details
      // dispatch(setGroupMembers({...groupMembers,membersDetails:[...groupMembers.membersDetails,userId]}));

      const result1 = await getGroupMembersDetails(selectedChat?._id);

      dispatch(setGroupMembers(result1?.data?.data[0]));

      console.log("add check", updatedChats);
      dispatch(setChats(updatedChats));

      toast.success(`You have added ${username} to ${selectedChat?.groupName}`);
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

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
          className="mr-4 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-primary"
          ref={profilRef}
          onClick={handleChatDetails}
        >
          {/* conditional avatar setup */}
          {selectedUser && <img src={selectedUser?.avatar} alt="" />}
          {selectedGroup && (
            <h2 className="text-2xl font-semibold text-black">
              {selectedGroup?.groupName.charAt(0).toUpperCase()}
            </h2>
          )}
        </div>

        {/* dynamic setup username || groupName */}
        <div>
          <h2 className="font-semibold" onClick={handleChatDetails}>
            {selectedUser ? selectedUser?.username : selectedGroup?.groupName}
          </h2>
          {selectedUser && (
            <h4 className="text-xs text-gray-400">
              {onlineUsers?.includes(selectedUser?._id) ? "Online" : "Offline"}
            </h4>
          )}{" "}
        </div>
      </div>
      {showChatDetails && (
        <div
          className={`absolute z-50 min-w-72 rounded-lg border border-gray-600 bg-[#1D232A] p-4 duration-700 ${
            showChatDetails ? "" : "overflow-hidden"
          }`}
          ref={chatDetailsRef}
        >
          <div className="absolute -top-2 h-4 w-4 rotate-45 border-l border-t border-gray-600 bg-[#1D232A]"></div>

          <div className="flex justify-center">
            <div className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-primary">
              {/* conditional avatar setup */}
              {selectedUser && <img src={selectedUser?.avatar} alt="" />}
              {selectedGroup && (
                <h2 className="text-3xl font-semibold text-black">
                  {selectedGroup?.groupName.charAt(0).toUpperCase()}
                </h2>
              )}
            </div>
          </div>
          <div className="mt-2 flex w-full flex-col items-center">
            <h3 className="text-xl font-bold">
              {selectedUser ? selectedUser.username : selectedGroup.groupName}
            </h3>
            <p className="text-gray-400">example@gmail.com</p>
          </div>
          {/* {groupMembers && groupMembers?._id === selectedChat?._id && (
            <div>
              <ul>
                {groupMembers?.membersDetails?.map((member) => {
                  return (
                    <li key={member._id}>
                      <p>{member?.username}</p>
                    </li>
                  );
                })}
              </ul>
            </div>
          )} */}
          {groupMembers &&
            selectedChat &&
            groupMembers._id === selectedChat._id && (
              <div>
                <ul>
                  {groupMembers.membersDetails?.map((member) => (
                    <li
                      key={member._id}
                      className="mb-2 mt-4 flex items-center justify-between border-y border-gray-600 p-2"
                    >
                      <div className="flex items-center gap-2">
                        <img src={member.avatar} alt="" className="h-8" />
                        <p className="font-semibold">{member.username}</p>
                      </div>
                      {groupMembers?.groupAdmin === authUser?._id &&
                        groupMembers?.groupAdmin !== member?._id && (
                          <Trash2
                            className="text-error"
                            onClick={() =>
                              handleRemoveUserFromGroup(
                                member?._id,
                                member?.username,
                              )
                            }
                          />
                        )}
                      {groupMembers?.groupAdmin === member?._id && <p>Admin</p>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* <button
            className="btn btn-outline btn-error w-full mt-4"
            onClick={handleDeleteChat}
          >
            Delete conversation
          </button> */}
          {selectedChat?.isGroupChat &&
            selectedChat?.groupAdmin !== authUser?._id && (
              <button
                className="btn btn-outline btn-error mt-4 w-full"
                onClick={handleLeaveGroup}
              >
                Leave group
              </button>
            )}

          {!selectedChat?.isGroupChat && (
            <button
              className="btn btn-outline btn-error mt-4 w-full"
              onClick={handleDeleteOneOnOneChat}
            >
              Delete Chat
            </button>
          )}

          {selectedChat?.groupAdmin === authUser?._id && (
            <button
              className="btn btn-outline btn-success mt-4 w-full"
              onClick={() => setShowAddUsersToGroup((prev) => !prev)}
            >
              Add users
            </button>
          )}

          {selectedChat?.groupAdmin === authUser?._id && (
            <button
              className="btn btn-outline btn-error mt-4 w-full"
              onClick={handleDeleteGroup}
            >
              Delete group
            </button>
          )}

          {showAddUsersToGroup && (
            <div className="w-full">
              <h2 className="mt-4 text-lg font-semibold">Available Users</h2>
              {availableUsers && (
                <ul className="max-h-[30vh] overflow-auto">
                  {availableUsers?.map((user) => {
                    console.log("groupmembers:", groupMembers);
                    if (
                      groupMembers?.membersDetails?.some(
                        (member) => member?._id === user?._id,
                      )
                    ) {
                      return;
                    }
                    return (
                      <li
                        key={user._id}
                        className="mb-2 mt-4 flex items-center justify-between border-y border-gray-600 p-2"
                      >
                        <div className="flex items-center gap-2">
                          <img src={user.avatar} alt="" className="h-8" />
                          <p className="font-semibold">{user.username}</p>
                        </div>
                        <UserPlus
                          onClick={() =>
                            handleAddUsersToGroup(user?._id, user?.username)
                          }
                        />
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ChatHeader;
