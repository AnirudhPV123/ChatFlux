import React from "react";
import { Cog } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setResetUserState } from "../../redux/userSlice";
import { logoutUser } from "../../api/user";
import { setResetMessagesState } from "../../redux/messageSlice";
import { setResetChatsState } from "../../redux/chatSlice";

function settings() {
  const { authUser } = useSelector((store) => store.user);
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await logoutUser();
    dispatch(setResetUserState());
    dispatch(setResetMessagesState());
    dispatch(setResetChatsState());
  };

  return (
    <div className="">
      <div className="dropdown dropdown-top h-[10vh] w-full">
        <Cog className="size-10 my-3 mx-6" tabIndex={0} role="button" />
        <ul
          tabIndex={0}
          className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box left-4 border border-gray-500"
        >
          <div className="flex justify-center items-center border-b border-gray-500 py-4 mb-2">
            <img
              src={authUser?.avatar}
              alt="profile-img"
              className="w-14 h-14 mr-4"
            />
            <div>
              <h2 className="">{authUser?.userName}</h2>
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

export default settings;
