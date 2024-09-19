import { useEffect } from "react";
import { getAvailableUsers } from "@/services/api/user";
import { setAvailableUsers } from "@/redux/userSlice";
import toast from "react-hot-toast";
import { useTypedDispatch } from "../useRedux";

/**
 * Custom hook to fetch available users from the API and update Redux store.
 * @returns {void}
 */
function useGetAvailableUsers() {
  const dispatch = useTypedDispatch();

  useEffect(() => {
    (async function () {
      try {
        const res = await getAvailableUsers();
        dispatch(setAvailableUsers(res.data?.data));
      } catch (error) {
        console.log(error);
        toast.error("Failed to fetch available users. Please try again later.");
      }
    })();
  }, [dispatch]);
}

export default useGetAvailableUsers;
