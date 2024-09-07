import { FormikErrors, FormikHelpers } from "formik";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { loginUser } from "@/services/api/auth";
import { setUserSlice } from "@/redux/userSlice";
import { AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";
import { AuthResponse, CustomError } from "./types";
import { LoginInitialValues } from "@/components/auth/types";
import { useNavigate } from "react-router-dom";

function useHandleLogin<T>() {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const mutation: UseMutationResult<AuthResponse, Error, LoginInitialValues> =
    useMutation({
      mutationFn: loginUser,
      mutationKey: ["authUser"],
    });

  const handleAuth = async (
    values: LoginInitialValues,
    { resetForm, setErrors }: FormikHelpers<T>,
  ) => {
    try {
      const res = await mutation.mutateAsync(values);
      const data = (res as AuthResponse).data.data;
      console.log("login return data", data);
      dispatch(setUserSlice(data));
      resetForm();
      navigate("/");
    } catch (error) {
      const customError = error as CustomError;
      setErrors({
        server:
          customError.response?.data?.message ||
          "An error occurred while attempting to authenticate",
      } as FormikErrors<T>);
    }
  };

  return { handleAuth, isLoading: mutation.isPending };
}

export default useHandleLogin;
