import { ArrowBigLeft, Trash2, UserPlus } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedChat,
  setSelectedGroup,
  setSelectedUser,
} from "../../redux/userSlice";
import {
  addUserToGroup,
  deleteChat,
  deleteGroup,
  getGroupMembersDetails,
  leaveGroup,
  removeUserFromGroup,
} from "../../api/chat";
import toast from "react-hot-toast";
import { setChats } from "../../redux/chatSlice";
import { setGroupMembers } from "../../redux/temporarySlice";
import useGetAvailableUsers from "../../hooks/useGetAvailableUsers";

function ChatHeader() {
  useGetAvailableUsers();

  const { selectedUser, selectedGroup, onlineUsers, authUser, availableUsers } =
    useSelector((store) => store.user);
  const { chats } = useSelector((store) => store.chat);

  const { selectedChat } = useSelector((store) => store.user);

  const { groupMembers } = useSelector((store) => store.temporary);

  const [showChatDetails, setShowChatDetails] = useState(false);
  const [showAddUsersToGroup, setShowAddUsersToGroup] = useState(false);

  const dispatch = useDispatch();
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
        (chat) => chat?._id !== result?.data?.data?.groupId
      );
      dispatch(setChats(updatedChats));
      toast.success(`You have leaved from ${selectedChat?.groupName}`);
      dispatch(setSelectedGroup(null));
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleDeleteGroup = async () => {
    try {
      const result = await deleteGroup(selectedChat?._id);

      const updatedChats = chats.filter(
        (chat) => chat?._id !== result?.data?.data?.groupId
      );
      dispatch(setChats(updatedChats));
      toast.success(`You have deleted ${selectedChat?.groupName}`);
      dispatch(setSelectedGroup(null));
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleRemoveUserFromGroup = async (userId, userName) => {
    try {
      const result = await removeUserFromGroup(selectedChat?._id, userId);
      console.log("result hei", result);

      const updatedChats = chats.map((chat) =>
        chat?._id === selectedChat?._id
          ? {
              ...chat,
              participants: chat.participants.filter((p) => p !== userId),
            }
          : chat
      );

      const updatedGroupMembers = groupMembers.membersDetails.filter(
        (member) => member?._id !== userId
      );

      console.log("updatedGrouMembners", updatedGroupMembers);

      dispatch(
        setGroupMembers({
          ...groupMembers,
          membersDetails: updatedGroupMembers,
        })
      );

      console.log("fuck", updatedChats);
      dispatch(setChats(updatedChats));
      toast.success(
        `You have removed ${userName} from ${selectedChat?.groupName}`
      );
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleAddUsersToGroup = async (userId, userName) => {
    try {
      const result = await addUserToGroup(selectedChat?._id, userId);

      const updatedChats = chats.map((chat) =>
        chat?._id === selectedChat?._id
          ? {
              ...chat,
              participants: [...chat.participants, userId],
            }
          : chat
      );

      // this is good code but we need user details when optimization make a function to get individual details
      // dispatch(setGroupMembers({...groupMembers,membersDetails:[...groupMembers.membersDetails,userId]}));

      const result1 = await getGroupMembersDetails(selectedChat?._id);

      dispatch(setGroupMembers(result1?.data?.data[0]));

      console.log("add check", updatedChats);
      dispatch(setChats(updatedChats));

      toast.success(`You have added ${userName} to ${selectedChat?.groupName}`);
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center  border-b border-gray-700 ml-4 flex-shrink-0 py-2">
        <ArrowBigLeft
          className={`size-8 mr-1 cursor-pointer hover:text-gray-600 ${
            window.innerWidth < 640 ? "block" : "hidden"
          }`}
          onClick={handleBackClick}
        />
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center bg-primary mr-4 cursor-pointer"
          ref={profilRef}
          onClick={handleChatDetails}
        >
          {/* conditional avatar setup */}
          {selectedUser && <img src={selectedUser?.avatar} alt="" />}
          {selectedGroup && (
            <h2 className="text-2xl text-black font-semibold ">
              {selectedGroup?.groupName.charAt(0).toUpperCase()}
            </h2>
          )}
        </div>

        {/* dynamic setup userName || groupName */}
        <div>
          <h2
            className="font-semibold cursor-pointer hover:font-bold hover:text-xl duration-200"
            onClick={handleChatDetails}
          >
            {selectedUser ? selectedUser?.userName : selectedGroup?.groupName}
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
          className={`bg-[#1D232A] border border-gray-600 absolute z-50 p-4 min-w-72 rounded-lg duration-700 ${
            showChatDetails ? "" : " overflow-hidden"
          }`}
          ref={chatDetailsRef}
        >
          <div className="absolute bg-[#1D232A] border-t border-l border-gray-600 -top-2 w-4 rotate-45 h-4"></div>

          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-primary cursor-pointer">
              {/* conditional avatar setup */}
              {selectedUser && <img src={selectedUser?.avatar} alt="" />}
              {selectedGroup && (
                <h2 className="text-3xl text-black font-semibold ">
                  {selectedGroup?.groupName.charAt(0).toUpperCase()}
                </h2>
              )}
            </div>
          </div>
          <div className="flex flex-col w-full items-center mt-2">
            <h3 className="font-bold text-xl">
              {selectedUser ? selectedUser.userName : selectedGroup.groupName}
            </h3>
            <p className="text-gray-400">example@gmail.com</p>
          </div>
          {/* {groupMembers && groupMembers?._id === selectedChat?._id && (
            <div>
              <ul>
                {groupMembers?.membersDetails?.map((member) => {
                  return (
                    <li key={member._id}>
                      <p>{member?.userName}</p>
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
                      className="flex p-2 mt-4 mb-2 justify-between border-y border-gray-600 items-center"
                    >
                      <div className="flex gap-2 items-center">
                        <img src={member.avatar} alt="" className="h-8" />
                        <p className="font-semibold">{member.userName}</p>
                      </div>
                      {groupMembers?.groupAdmin === authUser?._id &&
                        groupMembers?.groupAdmin !== member?._id && (
                          <Trash2
                            className="text-error"
                            onClick={() =>
                              handleRemoveUserFromGroup(
                                member?._id,
                                member?.userName
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
          {selectedChat?.groupAdmin !== authUser?._id && (
            <button
              className="btn btn-outline btn-error w-full mt-4"
              onClick={handleLeaveGroup}
            >
              Leave group
            </button>
          )}

          {selectedChat?.groupAdmin === authUser?._id && (
            <button
              className="btn btn-outline btn-success w-full mt-4"
              onClick={() => setShowAddUsersToGroup((prev) => !prev)}
            >
              Add users
            </button>
          )}

          {selectedChat?.groupAdmin === authUser?._id && (
            <button
              className="btn btn-outline btn-error w-full mt-4"
              onClick={handleDeleteGroup}
            >
              Delete group
            </button>
          )}

          {showAddUsersToGroup && (
            <div className="w-full ">
              <h2 className="font-semibold text-lg mt-4">Available Users</h2>
              {availableUsers && (
                <ul className="max-h-[30vh] overflow-auto">
                  {availableUsers?.map((user) => {
                    if (
                      groupMembers?.membersDetails?.some(
                        (member) => member?._id === user?._id
                      )
                    ) {
                      return;
                    }
                    return (
                      <li
                        key={user._id}
                        className="flex p-2 mt-4 mb-2 justify-between border-y border-gray-600 items-center"
                      >
                        <div className="flex gap-2 items-center">
                          <img src={user.avatar} alt="" className="h-8" />
                          <p className="font-semibold">{user.userName}</p>
                        </div>
                        <UserPlus
                          onClick={() =>
                            handleAddUsersToGroup(user?._id, user?.userName)
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
