import React from "react";
import Settings from "./Settings";
import { PhoneCall } from "lucide-react";

function BottomBar() {
  return (
    <div className="dropdown dropdown-top flex h-[10vh] w-full items-center justify-around ">
      <Settings />
      <PhoneCall />
    </div>
  );
}

export default BottomBar;
