import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setChatSearch } from "../../redux/temporarySlice";

function SearchUserOrGroup() {
  const [searchInput, setSearchInput] = useState("");
  const { chats } = useSelector((store) => store.chat);
  const { authUser } = useSelector((store) => store.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if(!chats)return
    const filteredChatIds = chats.filter((chat) =>
      !chat.isGroupChat
        ? chat.participants.find((prt) => {
            return (
              prt._id !== authUser?._id &&
              prt.userName.toLowerCase().includes(searchInput.toLowerCase())
            );
          })
        : chat.groupName.toLowerCase().includes(searchInput.toLowerCase())
    );

    console.log(filteredChatIds);
    dispatch(setChatSearch(filteredChatIds.length ? filteredChatIds : null));

  }, [searchInput, chats,authUser,dispatch]);

  return (
    <div className="search-input-container grow h-[6vh] w-1/2 overflow-hidden">
      <label className="input input-bordered border-gray-500 flex items-center gap-2 w-full">
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
