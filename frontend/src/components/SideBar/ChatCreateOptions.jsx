import { useState } from "react";
import UserOptions from "./UserOptions";
import { useDispatch, useSelector } from "react-redux";
import { createAGroupChat, createAOneOnOneChat } from "../../api/chat";
import { setChats } from "../../redux/chatSlice";
import toast from "react-hot-toast";

function ChatCreateOptions({ setAddChat }) {
  const { chats } = useSelector((store) => store.chat);
  const { availableUsers } = useSelector((store) => store.user);

  const [groupStatus, setGroupStatus] = useState(false);
  const [user, setUser] = useState({});
  const [groupUsers, setGroupUsers] = useState([]);
  const [groupName, setGroupName] = useState("");

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

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
        const res = await createAOneOnOneChat(user._id);
        dispatch(setChats([...chats, res.data.data[0]]));
        toast.success("Chat created successfully");
      } else {
        // Create group chat
        const participants = groupUsers.map((user) => user._id);
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
          "Something went wrong while creating chat."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="backdrop-blur-sm top-0 left-0 w-full h-full z-20 absolute">
      <div className="card w-[90vw] sm:w-1/2 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral text-neutral-content z-10">
        <div className="card-body flex gap-4">
          <h2 className="card-title">Create Chat</h2>
          <div className="form-control max-w-fit">
            <label className="cursor-pointer label">
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
            <div className="text-red-600 text-xs mb-2">
              All fields must be filled.
            </div>
          )}

          <div className="card-actions justify-end">
            <button
              className="btn btn-outline btn-ghost flex-1"
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
