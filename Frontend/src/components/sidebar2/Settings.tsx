// import React from "react";
// import { Cog } from "lucide-react";
// import { useDispatch, useSelector } from "react-redux";
// import { setResetUserState } from "../../redux/userSlice";
// import { logoutUser } from "../../api/user";
// import { setResetMessagesState } from "../../redux/messageSlice";
// import { setResetChatsState } from "../../redux/chatSlice";

import { Cog } from "lucide-react";

function Settings() {
  //   const { authUser } = useSelector((store) => store.user);
  //   const dispatch = useDispatch();

  //   const handleLogout = async () => {
  //     await logoutUser();
  //     dispatch(setResetUserState());
  //     dispatch(setResetMessagesState());
  //     dispatch(setResetChatsState());
  //   };

  return (
    <>
      <Cog className="size-10" tabIndex={0} role="button" />
      <ul
        tabIndex={0}
        className="menu dropdown-content left-4 z-[1] rounded-box border border-gray-500 bg-base-100 p-2 shadow"
      >
        <div className="mb-2 flex items-center justify-center border-b border-gray-500 py-4">
          <img
            //   src={authUser?.avatar}
            alt="profile-img"
            className="mr-4 h-14 w-14"
          />
          <div>
            <h2 className="">
              {/* {authUser?.userName} */}
              Username
            </h2>
            <h3 className="text-xs text-gray-500">
              {/* {authUser?.email} */}
              email
            </h3>
          </div>
        </div>
        <button
          className="btn btn-primary"
          //   onClick={handleLogout}
        >
          Logout
        </button>
      </ul>
    </>
  );
}

export default Settings;
