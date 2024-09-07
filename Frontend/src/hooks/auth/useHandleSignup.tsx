import { setUserSlice } from "@/redux/userSlice";
import { signupUser, signupVerifyOtp } from "@/services/api/auth";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { FormikErrors, FormikHelpers } from "formik";
import { AuthResponse, CustomError } from "./types";
import { SignUpInitialValues } from "@/components/auth/types";
import { useTypedDispatch } from "../useRedux";
import { useNavigate } from "react-router-dom";

function useHandleSignup<T>({
  isLastStep,
  next,
}: {
  isLastStep: boolean;
  next: () => void;
}) {
  const dispatch = useTypedDispatch();
  const navigate = useNavigate()

  const mutation: UseMutationResult<AuthResponse, Error, SignUpInitialValues> =
    useMutation({
      mutationFn: isLastStep ? signupVerifyOtp : signupUser,
      mutationKey: ["authUser"],
    });

  const handleAuth = async (
    values: T,
    { setErrors, resetForm }: FormikHelpers<T>,
  ) => {
    try {
      if (isLastStep) {
        const res = await mutation.mutateAsync(values as SignUpInitialValues);
        const data = (res as AuthResponse).data.data;
        dispatch(setUserSlice(data));
        resetForm();
        navigate('/')
      } else {
        await mutation.mutateAsync(values as SignUpInitialValues);
        console.log("signup return");
        next();
      }
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

export default useHandleSignup;
