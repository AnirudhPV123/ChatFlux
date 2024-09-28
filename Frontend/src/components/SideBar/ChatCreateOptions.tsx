import React, { memo, useEffect, useState } from "react";
import UserOptions from "./UserOptions";
import { createAGroupChat, createAOneOnOneChat } from "@/services/api/chat";
import { setChats } from "@/redux/chatSlice";
import toast from "react-hot-toast";
import { useTypedDispatch, useTypedSelector } from "@/hooks/useRedux";
import { UserType } from "@/redux/userSlice";
import { CustomErrorType } from "@/types";

type ChatCreateOptionsProps = {
  setAddChat: React.Dispatch<React.SetStateAction<boolean>>;
};

function ChatCreateOptions({ setAddChat }: ChatCreateOptionsProps) {
  const { chats } = useTypedSelector((store) => store.chat);
  const { availableUsers } = useTypedSelector((store) => store.user);

  const [isGroup, setIsGroup] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [groupUsers, setGroupUsers] = useState<UserType[] | []>([]);
  const [groupName, setGroupName] = useState("");

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useTypedDispatch();

  const handleCreateChat = async () => {
    // Validate form fields
    if (!isGroup && !user) {
      setError(true);
      return;
    }
    if (isGroup && !groupName) {
      setError(true);
      return;
    }

    setLoading(true);
    setError(false);
    try {
      if (!isGroup) {
        // Create one-on-one chat
        const res = await createAOneOnOneChat(user?._id);
        dispatch(setChats([res.data.data[0],...chats]));
        toast.success("Chat created successfully");
        setUser(null);
      } else {
        // Create group chat
        const participants = groupUsers.map((user) => user._id);
        const res = await createAGroupChat({ participants, groupName });
        dispatch(setChats([...chats, res.data.data[0]]));
        toast.success("Group chat created successfully");
        setGroupUsers([]);
        setGroupName("");
      }
    } catch (err) {
      const customError = err as CustomErrorType;
      toast.error(
        customError?.response?.data?.message ||
          "Something went wrong while creating chat.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setError(false);
    }
  }, [user]);

  return (
    <div className="absolute left-0 top-0 z-20 h-full w-full backdrop-blur-sm">
      <div className="card absolute left-1/2 top-1/2 z-10 w-[90vw] -translate-x-1/2 -translate-y-1/2 bg-neutral text-neutral-content sm:w-1/2">
        <div className="card-body flex gap-4">
          <h2 className="card-title">Create Chat</h2>
          <div className="form-control max-w-fit">
            <label className="label cursor-pointer">
              <input
                type="checkbox"
                className="toggle toggle-primary mr-4"
                checked={isGroup}
                onChange={() => {
                  setIsGroup((status) => !status);
                  setError(false);
                }}
              />
              <span className="label-text">Is it a group chat?</span>
            </label>
          </div>

          {/*  user select option */}
          <UserOptions
            options={availableUsers}
            isGroup={isGroup}
            user={user}
            groupUsers={groupUsers}
            setUser={setUser}
            setGroupUsers={setGroupUsers}
            groupName={groupName}
            setGroupName={setGroupName}
          />

          {error && (
            <div className="mb-2 text-xs text-red-600">
              All fields must be filled.
            </div>
          )}

          <div className="card-actions justify-end">
            <button
              className="btn btn-ghost btn-outline flex-1"
              onClick={() => setAddChat(false)}
              disabled={loading}
            >
              Close
            </button>
            <button
              className="btn btn-primary flex-1"
              onClick={handleCreateChat}
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-bars loading-md"></span>
              ) : (
                "Create"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ChatCreateOptions);
