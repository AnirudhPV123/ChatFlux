import { AppDispatch } from "@/redux/store";
import { setUserSlice } from "@/redux/userSlice";
import {
  forgotPasswordVerifyEmail,
  forgotPasswordVerifyOtp,
  resetPassword,
} from "@/services/api/auth";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { FormikErrors, FormikHelpers } from "formik";
import { useDispatch } from "react-redux";
import { AuthResponse, CustomError } from "./types";
import { ForgotPasswordInitialValues } from "@/components/auth/types";
import { useNavigate } from "react-router-dom";

function useHandleForgotPassword<T>({
  currentStepIndex,
  next,
}: {
  next: () => void;
  currentStepIndex: number;
}) {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const mutation: UseMutationResult<
    AuthResponse,
    Error,
    ForgotPasswordInitialValues
  > = useMutation({
    mutationFn:
      currentStepIndex === 1
        ? forgotPasswordVerifyEmail
        : currentStepIndex === 2
          ? forgotPasswordVerifyOtp
          : resetPassword,
    mutationKey: ["authUser"],
  });

  const handleAuth = async (
    values: ForgotPasswordInitialValues,
    { setErrors, resetForm }: FormikHelpers<T>,
  ) => {
    try {
      if (currentStepIndex === 1) {
        await mutation.mutateAsync(values);
        next();
      } else if (currentStepIndex === 2) {
        await mutation.mutateAsync(values);
        next();
      } else if (currentStepIndex === 4) {
        const res = await mutation.mutateAsync(values);
        const data = (res as AuthResponse).data.data;
        dispatch(setUserSlice(data));
        resetForm();
        navigate("/");
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

export default useHandleForgotPassword;
