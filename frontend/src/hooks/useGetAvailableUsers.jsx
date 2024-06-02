import React, { useEffect } from "react";
import { getAvailableUsers } from "../api/user";
import { useDispatch } from "react-redux";
import { setAvailableUsers } from "../redux/userSlice";
import toast from "react-hot-toast";

/**
 * Custom hook to fetch available users from the API and update Redux store.
 * @returns {void}
 */
function useGetAvailableUsers() {
  const dispatch = useDispatch();

  useEffect(() => {
    (async function () {
      try {
        const res = await getAvailableUsers();
        dispatch(setAvailableUsers(res.data?.data));
      } catch (error) {
        toast.error("Failed to fetch available users. Please try again later.");
      }
    })();
  }, [dispatch]); // Include dispatch in the dependency array

  // No need to return anything from a custom hook
}

export default useGetAvailableUsers;
