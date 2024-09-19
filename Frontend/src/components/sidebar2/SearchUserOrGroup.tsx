import React from "react";

function SearchUserOrGroup() {
  return (
    <div className="search-input-container h-[6vh] w-1/2 grow overflow-hidden">
      <label className="input input-bordered flex w-full items-center gap-2 border-gray-500">
        <input
          type="text"
          id="search-input"
          className="grow"
          placeholder="Search user or group..."
          //   value={searchInput}
          //   onChange={(e) => setSearchInput(e.target.value)}
        />
      </label>
    </div>
  );
}

export default SearchUserOrGroup;
