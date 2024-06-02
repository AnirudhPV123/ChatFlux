import { Paperclip, SendHorizontal } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { sendGroupMessage, sendMessage } from "../../api/message";
import toast from "react-hot-toast";
import { useState, useCallback } from "react";
import { setMessages } from "../../redux/messageSlice";

function SendInput() {
  const [message, setMessage] = useState("");
  const { selectedUser, selectedGroup } = useSelector((store) => store.user);
  const { messages } = useSelector((store) => store.message);
  const dispatch = useDispatch();

  const handleSendMessage = useCallback(
    async (e) => {
      e.preventDefault();
      if (!message) {
        return;
      }

      try {
        let res;
        if (selectedUser) {
          res = await sendMessage(selectedUser._id, message);
        } else if (selectedGroup) {
          res = await sendGroupMessage(selectedGroup._id, message);
        }

        if (res && res.data && res.data.data) {
          dispatch(setMessages([...messages, res.data.data]));
          setMessage("");
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "An error occurred while sending the message."
        );
      }
    },
    [message, selectedUser, selectedGroup, messages, dispatch]
  );

  return (
    <div id="send-input" className="h-[10vh] flex items-center gap-4 px-4">
      <Paperclip />
      <form
        onSubmit={handleSendMessage}
        className="grow flex items-center gap-2"
      >
        <input
          type="text"
          className="grow input input-bordered border-gray-500"
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" className="flex items-center">
          <SendHorizontal />
        </button>
      </form>
    </div>
  );
}

export default SendInput;
