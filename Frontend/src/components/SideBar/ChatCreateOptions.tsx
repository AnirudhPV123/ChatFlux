import { useState } from "react";
import UserOptions from "./UserOptions";
import { createAGroupChat, createAOneOnOneChat } from "@/services/api/chat";
import { setChats } from "@/redux/chatSlice";
import toast from "react-hot-toast";
import { useTypedDispatch, useTypedSelector } from "@/hooks/useRedux";

function ChatCreateOptions({ setAddChat }) {
  const { chats } = useTypedSelector((store) => store.chat);
  const { availableUsers } = useTypedSelector((store) => store.user);
  console.log("chec", availableUsers);

  const [groupStatus, setGroupStatus] = useState(false);
  const [user, setUser] = useState({});
  const [groupUsers, setGroupUsers] = useState([]);
  const [groupName, setGroupName] = useState("");

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useTypedDispatch();

  const handleCreateChat = async () => {
    setLoading(true);
    try {
      // Validate form fields
      if (!groupStatus && Object.keys(user).length === 0) {
        setError(true);
        return;
      }
      if (groupStatus && (!groupName || groupUsers.length === 0)) {
        setError(true);
        return;
      }

      setError(false);

      if (!groupStatus) {
        // Create one-on-one chat
        console.log("create one on one chat", user._id);
        const res = await createAOneOnOneChat(user._id);
        console.log("res", res);
        dispatch(setChats([...chats, res.data.data[0]]));
        toast.success("Chat created successfully");
      } else {
        // Create group chat
        const participants = groupUsers.map((user) => user._id);
        console.log("create group chat", participants, groupName);
        const res = await createAGroupChat({ participants, groupName });
        dispatch(setChats([...chats, res.data.data[0]]));
        toast.success("Group chat created successfully");
      }

      // Reset form fields after successful creation
      setUser({});
      setGroupUsers([]);
      setGroupName("");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Something went wrong while creating chat.",
      );
    } finally {
      setLoading(false);
    }
  };

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
                checked={groupStatus}
                onChange={() => setGroupStatus((status) => !status)}
              />
              <span className="label-text">Is it a group chat?</span>
            </label>
          </div>

          {/*  user select option */}
          <UserOptions
            options={availableUsers}
            groupStatus={groupStatus}
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

export default ChatCreateOptions;
