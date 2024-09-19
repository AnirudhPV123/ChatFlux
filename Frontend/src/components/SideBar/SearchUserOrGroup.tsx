import { useEffect, useState } from "react";
import { setChatSearch } from "../../redux/temporarySlice";
import { useTypedDispatch, useTypedSelector } from "@/hooks/useRedux";

function SearchUserOrGroup() {
  const [searchInput, setSearchInput] = useState("");
  const { chats } = useTypedSelector((store) => store.chat);
  const { authUser } = useTypedSelector((store) => store.user);
  const dispatch = useTypedDispatch();

  useEffect(() => {
    if (!chats) return;
    const filteredChatIds = chats.filter((chat) =>
      !chat.isGroupChat
        ? chat.participants.find((prt) => {
            return (
              prt._id !== authUser?._id &&
              prt.username.toLowerCase().includes(searchInput.toLowerCase())
            );
          })
        : chat.groupName.toLowerCase().includes(searchInput.toLowerCase()),
    );

    console.log(filteredChatIds);
    dispatch(setChatSearch(filteredChatIds.length ? filteredChatIds : null));
  }, [searchInput, chats, authUser, dispatch]);

  return (
    <div className="search-input-container h-[6vh] w-1/2 grow overflow-hidden">
      <label className="input input-bordered flex w-full items-center gap-2 border-gray-500">
        <input
          type="text"
          id="search-input"
          className="grow"
          placeholder="Search user or group..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </label>
    </div>
  );
}

export default SearchUserOrGroup;
