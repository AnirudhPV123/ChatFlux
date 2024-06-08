import { Search } from "lucide-react";

function SearchUserOrGroup() {
  return (
    <div className="search-input-container grow h-[6vh] w-1/2 overflow-hidden">
      <label className="input input-bordered border-gray-500 flex items-center gap-2 w-full">
        <input
          type="text"
          id="search-input"
          className="grow"
          placeholder="Search user or group..."
        />

        {/* <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="w-6 h-6 opacity-70 hidden lg:block"
        >
          <path
            fillRule="evenodd"
            d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
            clipRule="evenodd"
          />
        </svg> */}
      </label>
    </div>
  );
}

export default SearchUserOrGroup;
