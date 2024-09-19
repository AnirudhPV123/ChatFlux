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
      value
        ? option.username.toLowerCase().includes(value.toLowerCase())
        : true,
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
          className="input input-bordered mb-2 w-full pr-10"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
      )}
      <input
        className="input input-bordered w-full pr-10"
        value={user.username || value}
        onChange={handleChange}
        placeholder={
          groupStatus
            ? "Select group participants..."
            : "Select a user to chat..."
        }
        onFocus={() => setShowSuggestions(true)}
      />
      {user.username && (
        <X
          className="absolute right-3 top-1/2 -translate-y-1/2 transform cursor-pointer"
          onClick={handleDeleteUser}
        />
      )}
      {showSuggestions && (
        <ul
          className="suggestions absolute mt-2 flex flex-col gap-2 rounded-lg border border-gray-600 bg-[#1D232A] px-4 py-2"
          style={{ width: autocompleteRef.current.offsetWidth }}
        >
          {suggestions.map((user) => (
            <li
              className="flex h-10 cursor-pointer items-center rounded-md px-4 py-2 hover:bg-slate-600"
              onClick={() => handleSuggestionClick(user)}
              key={user._id}
            >
              {user.username}
            </li>
          ))}
        </ul>
      )}
      {groupStatus && (
        <div className="mt-2 flex flex-wrap gap-2">
          {groupUsers.map((user) => (
            <div
              key={user._id}
              className="flex items-center gap-x-2 rounded-full border-2 border-gray-600 bg-[#1D232A] px-4 py-2 outline-none"
            >
              <div className="w-8 overflow-hidden rounded-full">
                <img src={user?.avatar} alt="User Avatar" />
              </div>
              <h2>{user.username}</h2>
              <div className="flex justify-center rounded-full bg-neutral p-1">
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