import SearchUserOrGroup from "./SearchUserOrGroup";
import AddChatBtn from "./AddChatBtn";
import AllChats from "./AllChats";
import { useTypedSelector } from "@/hooks/useRedux";
import BottomBar from "./BottomBar";
import AllCalls from "./AllCalls";

function SideBar() {
  const { selectedUser, selectedGroup } = useTypedSelector(
    (store) => store.user,
  );
  const { bottomBarIsCall } = useTypedSelector((store) => store.temporary);

  // used to dynamically show messageContainer or sideBar for smaller screen
  if (window.innerWidth < 640 && (selectedUser || selectedGroup)) return;

  return (
    <div
      className={`sidebar md:2/5 h-[100vh] w-full overflow-hidden border-r border-gray-700 pb-6 sm:w-2/4 lg:w-1/3`}
    >
      <div className="add-chat flex gap-4 px-2 py-4">
        <SearchUserOrGroup />
        <AddChatBtn />
      </div>
      {!bottomBarIsCall ? <AllChats /> : <AllCalls />}
      <BottomBar />
    </div>
  );
}

export default SideBar;
