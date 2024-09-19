import { Cog } from "lucide-react";
import { clearUserSlice } from "@/redux/userSlice";
import { logoutUser } from "@/services/api/auth";
import { setResetMessagesState } from "@/redux/messageSlice";
import { setResetChatsState } from "@/redux/chatSlice";
import { useTypedDispatch, useTypedSelector } from "@/hooks/useRedux";

function Settings() {
  const { authUser } = useTypedSelector((store) => store.user);
  const dispatch = useTypedDispatch();

  console.log(authUser);
  

  const handleLogout = async () => {
    await logoutUser();
    dispatch(clearUserSlice());
    dispatch(setResetMessagesState());
    dispatch(setResetChatsState());
  };

  return (
    <div className="">
      <div className="dropdown dropdown-top h-[10vh] w-full">
        <Cog className="mx-6 my-3 size-10" tabIndex={0} role="button" />
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
    </div>
  );
}

export default Settings;
