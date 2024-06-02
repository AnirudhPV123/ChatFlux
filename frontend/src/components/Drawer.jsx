import { AlignJustify, X } from "lucide-react";
import React from "react";

function Drawer() {
  return (
    <div className="drawer drawer-end ">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        {/* Page content here */}
        <label htmlFor="my-drawer-4" className="btn btn-primary m-4">
          <AlignJustify />
        </label>
      </div>
      <div className="drawer-side">
        <label
          htmlFor="my-drawer-4"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="menu px-4 w-80 min-h-full bg-base-200 text-base-content">
          {/* Sidebar content here */}
          <div
            className="flex justify-end"
            htmlFor="my-drawer-4"
            aria-label="close sidebar"
          >
            <label className="btn btn-primary m-4">
              <X />
            </label>
          </div>
          <li>
            <a>Sidebar Item 1</a>
          </li>
          <li>
            <a>Sidebar Item 2</a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Drawer;
