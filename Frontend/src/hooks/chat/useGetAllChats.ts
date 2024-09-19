import { useEffect } from "react";
import { setChats } from "@/redux/chatSlice";
import toast from "react-hot-toast";
import { getAllChats } from "@/services/api/chat";
import { CustomError } from "../auth/types";
import { useTypedDispatch } from "../useRedux";

function useGetAllChats() {
  const dispatch = useTypedDispatch();
  useEffect(() => {
    (async function () {
      try {
        const res = await getAllChats();
        console.log("get all chats", res);
        dispatch(setChats(res.data?.data));
      } catch (error) {
        const customError = error as CustomError;
        toast.error(
          customError?.response?.data?.message ||
            "Something went wrong while fetching all chats.",
        );
      }
    })();
  }, []);
}

export default useGetAllChats;
