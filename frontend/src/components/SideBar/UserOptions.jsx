import { useState, useEffect, useRef, useMemo } from "react";
import { X } from "lucide-react";

const UserOptions = ({
  options,
  groupStatus,
  groupUsers,
  user,
  setGroupUsers,
  setUser,
  groupName,
  setGroupName,
}) => {
  const [value, setValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteRef = useRef();

  // Filter options based on input value
  const suggestions = useMemo(() => {
    return options.filter((option) =>
      value ? option.userName.toLowerCase().includes(value.toLowerCase()) : true
    );
  }, [value, options]);

  // Handle click outside of autocomplete to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Handle input change
  const handleChange = (event) => {
    setValue(event.target.value);
    setShowSuggestions(true);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    if (groupStatus) {
      if (!groupUsers.some((u) => u._id === suggestion._id)) {
        setGroupUsers((prev) => [...prev, suggestion]);
        setValue("");
      }
    } else {
      setUser(suggestion);
      setValue("");
    }
    setShowSuggestions(false);
  };

  // Delete user from one-on-one chat
  const handleDeleteUser = () => {
    setUser({});
    setValue("");
    setShowSuggestions(true);
  };

  // Delete user from group chat
  const handleDeleteGroupUser = (userId) => {
    console.log("userId", userId);
    setGroupUsers(groupUsers.filter((user) => user._id !== userId));
  };

  // Reset form fields when group status changes
  useEffect(() => {
    setUser({});
    setValue("");
    setGroupUsers([]);
    setGroupName("");
  }, [groupStatus]);

  // Clear input value when groupUsers array is empty
  useEffect(() => {
    if (groupUsers.length === 0) setValue("");
  }, [groupUsers]);

  return (
    <div className="autocomplete relative" ref={autocompleteRef}>
      {groupStatus && (
        <input
          type="text"
          placeholder="Enter a group name..."
          className="input input-bordered w-full pr-10 mb-2"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
      )}
      <input
        className="input input-bordered w-full pr-10"
        value={user.userName || value}
        onChange={handleChange}
        placeholder={
          groupStatus
            ? "Select group participants..."
            : "Select a user to chat..."
        }
        onFocus={() => setShowSuggestions(true)}
      />
      {user.userName && (
        <X
          className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer"
          onClick={handleDeleteUser}
        />
      )}
      {showSuggestions && (
        <ul
          className="suggestions border border-gray-600 rounded-lg mt-2 px-4 py-2 flex flex-col gap-2 absolute bg-[#1D232A]"
          style={{ width: autocompleteRef.current.offsetWidth }}
        >
          {suggestions.map((user) => (
            <li
              className="h-10 flex items-center hover:bg-slate-600 py-2 px-4 rounded-md cursor-pointer"
              onClick={() => handleSuggestionClick(user)}
              key={user._id}
            >
              {user.userName}
            </li>
          ))}
        </ul>
      )}
      {groupStatus && (
        <div className="flex flex-wrap gap-2 mt-2">
          {groupUsers.map((user) => (
            <div
              key={user._id}
              className="px-4 py-2 bg-[#1D232A] border-2 border-gray-600 rounded-full outline-none flex gap-x-2 items-center"
            >
              <div className="rounded-full w-8">
                <img src={user.avatar} alt="User Avatar" />
              </div>
              <h2>{user.userName}</h2>
              <div className="bg-neutral flex justify-center p-1 rounded-full">
                {" "}
                <X
                  className="cursor-pointer"
                  onClick={() => handleDeleteGroupUser(user._id)}
                />
              </div>{" "}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserOptions;
