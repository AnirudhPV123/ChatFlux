import { TbMessageFilled } from "react-icons/tb";
import Settings from "./Settings";
import { IoCall } from "react-icons/io5";
import { useCallback } from "react";
import { useTypedDispatch, useTypedSelector } from "@/hooks/useRedux";
import { setBottomBarIsCall } from "@/redux/temporarySlice";

function BottomBar() {
  const { bottomBarIsCall } = useTypedSelector((store) => store.temporary);
  const dispatch = useTypedDispatch();
  const handleBottomBar = useCallback(
    ({ isCall }: { isCall: boolean }) => {
      dispatch(setBottomBarIsCall(isCall));
    },
    [dispatch],
  );

  return (
    <div className="relative flex justify-between">
      <div className="ml-4 flex gap-8">
        <TbMessageFilled
          className={`my-3 size-10 p-1 cursor-pointer rounded-md ${!bottomBarIsCall && "bg-slate-600"}`}
          onClick={() => handleBottomBar({ isCall: false })}
        />
        <IoCall
          className={`my-3 size-9 p-1 cursor-pointer rounded-md ${bottomBarIsCall && "bg-slate-600"}`}
          onClick={() => handleBottomBar({ isCall: true })}
        />
      </div>
      <Settings />
    </div>
  );
}

export default BottomBar;
