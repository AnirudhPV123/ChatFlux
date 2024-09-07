import { AppDispatch } from "@/redux/store";
import { setUserSlice, UserType } from "@/redux/userSlice";
import {
  forgotPasswordVerifyEmail,
  forgotPasswordVerifyOtp,
  resetPassword,
} from "@/services/api/auth";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { FormikErrors, FormikHelpers } from "formik";
import { useDispatch } from "react-redux";

interface CustomError extends Error {
  response?: {
    data?: {
      message: string;
    };
  };
}

type AuthResponse = {
  data: {
    data: UserType;
  };
};

type AuthMutation<T> = UseMutationResult<AuthResponse, Error, T>;

function useHandleForgotPassword<T>({
  currentStepIndex,
  next,
}: {
  next: () => void;
  currentStepIndex: number;
}) {
  const dispatch: AppDispatch = useDispatch();

  const mutation: AuthMutation<T> = useMutation({
    mutationFn:
      currentStepIndex === 1
        ? forgotPasswordVerifyEmail
        : currentStepIndex === 2
          ? forgotPasswordVerifyOtp
          : resetPassword,
    mutationKey: ["authUser"],
  });

  const handleAuth = async (
    values: T,
    { setErrors, resetForm }: FormikHelpers<T>,
  ) => {
    try {
      if (currentStepIndex === 1) {
        const res = await mutation.mutateAsync(values);
        next();
      } else if (currentStepIndex === 2) {
        const res = await mutation.mutateAsync(values);
        next();
      } else if (currentStepIndex === 4) {
        const res = await mutation.mutateAsync(values);
        const data = (res as AuthResponse).data.data;
        dispatch(setUserSlice(data));
        resetForm();
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
