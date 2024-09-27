import { Cog } from "lucide-react";
import { clearUserSlice } from "@/redux/userSlice";
import { logoutUser } from "@/services/api/auth";
import { setResetMessagesState } from "@/redux/messageSlice";
import { setResetChatsState } from "@/redux/chatSlice";
import { useTypedDispatch, useTypedSelector } from "@/hooks/useRedux";
import { resetTemporarySlice } from "@/redux/temporarySlice";

function Settings() {
  const { authUser } = useTypedSelector((store) => store.user);
  const dispatch = useTypedDispatch();

  const handleLogout = async () => {
    await logoutUser();
    dispatch(clearUserSlice());
    dispatch(setResetMessagesState());
    dispatch(setResetChatsState());
    dispatch(resetTemporarySlice());
  };

  return (
    <div className="dropdown dropdown-top relative h-[10vh] w-[15rem]">
      <Cog
        className="absolute right-0 mx-6 my-3 size-9"
        tabIndex={0}
        role="button"
      />
      <ul
        tabIndex={0}
        className="menu dropdown-content left-4 z-[1] rounded-box border border-gray-500 bg-base-100 p-2 shadow"
      >
        <div className="mb-2 flex items-center justify-center border-b border-gray-500 py-4">
          <img
            src={authUser?.avatar}
            alt="profile-img"
            className="mr-4 h-14 w-14"
          />
          <div>
            <h2 className="">{authUser?.username}</h2>
            <h3 className="text-xs text-gray-500">{authUser?.email}</h3>
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleLogout}>
          Logout
        </button>
      </ul>
    </div>
  );
}

export default Settings;
