import { useTypedDispatch, useTypedSelector } from "@/hooks/useRedux";
import { ChatType, setChats } from "@/redux/chatSlice";
import { setGroupMembers } from "@/redux/temporarySlice";
import { setSelectedGroup, setSelectedUser } from "@/redux/userSlice";
import swal from "sweetalert";
import {
  addUserToGroup,
  deleteChat,
  deleteGroup,
  getGroupMembersDetails,
  leaveGroup,
  removeUserFromGroup,
} from "@/services/api/chat";
import { Trash2, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { memo, useCallback } from "react";

type ChatDetailsProps = {
  showChatDetails: boolean;
  chatDetailsRef: React.MutableRefObject<HTMLDivElement | null>;
  showAddUsersToGroup: boolean;
  setShowAddUsersToGroup: React.Dispatch<React.SetStateAction<boolean>>;
};

function ChatDetails({
  showChatDetails,
  chatDetailsRef,
  showAddUsersToGroup,
  setShowAddUsersToGroup,
}: ChatDetailsProps) {
  const {
    selectedUser,
    selectedGroup,
    authUser,
    availableUsers,
    selectedChat,
  } = useTypedSelector((store) => store.user);
  const { chats } = useTypedSelector((store) => store.chat);
  const { groupMembers } = useTypedSelector((store) => store.temporary);
  const dispatch = useTypedDispatch();

  // almost same code as handleRemoveUserFromGroup
  const handleLeaveGroup = useCallback(async () => {
    try {
      const result = await leaveGroup(selectedChat?._id as string);
      const updatedChats = chats.filter(
        (chat: ChatType) => chat?._id !== result?.data?.data?.groupId,
      );
      dispatch(setChats(updatedChats));
      toast.success(`You have left from ${selectedChat?.groupName}`);
      dispatch(setSelectedGroup(null));
    } catch (error) {
      toast.error("Something went wrong");
    }
  }, [chats, dispatch, selectedChat]);

  const handleDeleteOneOnOneChat = useCallback(async () => {
    try {
      const result = await deleteChat(selectedChat?._id as string, selectedUser?._id as string);
      const updatedChats = chats.filter(
        (chat: ChatType) => chat?._id !== result?.data?.data?._id,
      );
      dispatch(setChats(updatedChats));
      toast.success(`You have deleted ${selectedUser?.username}`);
      dispatch(setSelectedUser(null));
    } catch (error) {
      toast.error("Something went wrong");
    }
  }, [chats, dispatch, selectedChat, selectedUser]);

  const handleDeleteGroup = useCallback(async () => {
    try {
      const result = await deleteGroup(selectedChat?._id as string);
      const updatedChats = chats.filter(
        (chat: ChatType) => chat?._id !== result?.data?.data?.groupId,
      );
      dispatch(setChats(updatedChats));
      toast.success(`You have deleted ${selectedChat?.groupName}`);
      dispatch(setSelectedGroup(null));
    } catch (error) {
      toast.error("Something went wrong");
    }
  }, [chats, dispatch, selectedChat]);

  const handleRemoveUserFromGroup = useCallback(
    async (userId: string, username: string) => {
      try {
        await removeUserFromGroup(selectedChat?._id as string, userId);

        const updatedChats = chats.map((chat: ChatType) =>
          chat?._id === selectedChat?._id
            ? {
                ...chat,
                participants: chat.participants.filter(
                  (p) => p.toString() !== userId,
                ),
              }
            : chat,
        );

        const updatedGroupMembers = groupMembers?.membersDetails.filter(
          (member) => member?._id !== userId,
        );

        dispatch(
          setGroupMembers({
            ...groupMembers,
            membersDetails: updatedGroupMembers,
          }),
        );

        dispatch(setChats(updatedChats));
        toast.success(
          `You have removed ${username} from ${selectedChat?.groupName}`,
        );
      } catch (error) {
        toast.error("Something went wrong");
      }
    },
    [chats, dispatch, groupMembers, selectedChat],
  );

  const handleAddUsersToGroup = useCallback(
    async (userId: string, username: string) => {
      try {
        await addUserToGroup(selectedChat?._id as string, userId);

        const updatedChats = chats.map((chat: ChatType) =>
          chat?._id === selectedChat?._id
            ? {
                ...chat,
                participants: [...chat.participants, userId],
              }
            : chat,
        );

        const result = await getGroupMembersDetails(selectedChat?._id as string);
        dispatch(setGroupMembers(result?.data?.data[0]));
        dispatch(setChats(updatedChats));
        toast.success(
          `You have added ${username} to ${selectedChat?.groupName}`,
        );
      } catch (error) {
        toast.error("Something went wrong");
      }
    },
    [chats, dispatch, selectedChat],
  );

  const showConfirmationDialog = useCallback(
    (message: string, onConfirm: () => void) => {
      swal({
        title: "Are you sure?",
        text: message,
        icon: "warning",
        buttons: ["Cancel", "OK"],
        dangerMode: true,
      }).then((willDelete) => {
        if (willDelete) onConfirm();
      });
    },
    [],
  );

  return (
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
          {selectedUser ? selectedUser.username : selectedGroup?.groupName}
        </h3>
        <p className="text-gray-400">example@gmail.com</p>
      </div>

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

      {selectedChat?.isGroupChat &&
        selectedChat?.groupAdmin !== authUser?._id && (
          <button
            className="btn btn-outline btn-error mt-4 w-full"
            onClick={() => {
              showConfirmationDialog(
                "Are you sure that you want to leave this group?",
                handleLeaveGroup,
              );
            }}
          >
            Leave group
          </button>
        )}

      {!selectedChat?.isGroupChat && (
        <button
          className="btn btn-outline btn-error mt-4 w-full"
          onClick={() => {
            showConfirmationDialog(
              "Are you sure that you want to delete this chat?",
              handleDeleteOneOnOneChat,
            );
          }}
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
          onClick={() => {
            showConfirmationDialog(
              "Are you sure that you want to delete this group?",
              handleDeleteGroup,
            );
          }}
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
  );
}

export default memo(ChatDetails);
