import { Plus } from "lucide-react";
import ChatCreateOptions from "./ChatCreateOptions";
import { useState } from "react";
import useGetAvailableUsers from "@/hooks/chat/useGetAvailableUsers";

function AddChatBtn() {
  useGetAvailableUsers(); 

  const [addChat, setAddChat] = useState(false);
  return (
    <div id="add-chat-button">
      <button
        className="btn btn-primary text-white textarea-sm"
        onClick={() => {
          setAddChat(true);
        }}
      >
        <Plus />
        <h3 className="hidden xl:block">Add Chat</h3>
      </button>

      {/* chat create option popup */}
      {addChat && <ChatCreateOptions setAddChat={setAddChat} />}
    </div>
  );
}

export default AddChatBtn;
