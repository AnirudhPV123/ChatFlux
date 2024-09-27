import { useEffect } from "react";
import toast from "react-hot-toast";
import { getAllCalls } from "@/services/api/chat";
import { CustomError } from "../auth/types";
import { useTypedDispatch } from "../useRedux";
import { setCalls } from "@/redux/callSlice";

function useGetAllCalls() {
  const dispatch = useTypedDispatch();
  useEffect(() => {
    (async function () {
      try {
        const res = await getAllCalls();
        console.log(res);
        dispatch(setCalls(res.data?.data));
      } catch (error) {
        const customError = error as CustomError;
        toast.error(
          customError?.response?.data?.message ||
            "Something went wrong while fetching all chats.",
        );
      }
    })();
  }, [dispatch]);
}

export default useGetAllCalls;
