import { Plus } from "lucide-react";
import ChatCreateOptions from "./ChatCreateOptions";
import { useState } from "react";
import useGetAvailableUsers from "../../hooks/useGetAvailableUsers";

function AddChatBtn() {
  useGetAvailableUsers(); 

  const [addChat, setAddChat] = useState(false);
  return (
    <div id="add-chat-button">
      <button
        className="btn btn-primary text-white"
        onClick={() => {
          setAddChat(true);
        }}
      >
        <Plus /> Add Chat
      </button>

        {/* chat create option popup */}
      {addChat && <ChatCreateOptions setAddChat={setAddChat} />}
    </div>
  );
}

export default AddChatBtn;
